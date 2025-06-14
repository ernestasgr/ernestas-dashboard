import {
	ApolloGateway,
	IntrospectAndCompose,
	RemoteGraphQLDataSource,
} from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { z } from "zod";

/**
 * Validates an access token by making a GraphQL query to the auth service.
 *
 * @param accessToken - The access token to validate
 * @param authUrl - The URL of the auth service
 * @param gatewaySecret - The gateway secret for authentication
 * @returns Promise<{valid: boolean, user?: {email: string, name: string}}> - Validation result with user data if valid
 */
async function validateAccessToken(
	accessToken: string,
	authUrl: string,
	gatewaySecret: string
): Promise<{ valid: boolean; user?: { email: string; name: string } }> {
	try {
		const response = await fetch(`${authUrl}/graphql`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-gateway-secret": gatewaySecret,
				cookie: `accessToken=${accessToken}`,
			},
			body: JSON.stringify({
				query: `
					query Me {
						me {
							email
							name
						}
					}
				`,
			}),
		});

		if (!response.ok) {
			return { valid: false };
		}

		const data = await response.json();

		if (!data.errors && data.data?.me?.email) {
			return {
				valid: true,
				user: {
					email: data.data.me.email,
					name: data.data.me.name,
				},
			};
		}

		return { valid: false };
	} catch (error) {
		console.error("Token validation error:", error);
		return { valid: false };
	}
}

/**
 * Checks if a GraphQL operation should be exempt from token validation.
 *
 * @param body - The request body containing the GraphQL query
 * @returns boolean - True if the operation should be exempt from validation
 */
function isExemptOperation(body: any): boolean {
	if (!body?.query) return false;

	const query = body.query.toLowerCase().trim();

	// Allow introspection queries
	if (query.includes("__schema")) {
		return true;
	}

	if (query.includes("query") && query.includes("me")) {
		return true;
	}

	if (query.includes("mutation") && query.includes("refresh")) {
		return true;
	}

	return false;
}

/**
 * Validates and parses required environment variables for the gateway.
 *
 * Ensures that {@link AUTH_URL} and {@link AUTH_REDIRECT_URL} are valid URLs and that {@link GATEWAY_SECRET} is present.
 *
 * @returns An object containing the validated environment variables.
 *
 * @throws {ZodError} If any required environment variable is missing or invalid.
 */
function getEnv() {
	const envSchema = z.object({
		AUTH_URL: z.string().url(),
		AUTH_REDIRECT_URL: z.string().url(),
		GATEWAY_SECRET: z.string(),
		FRONTEND_DOMAIN: z.string().url(),
	});

	return envSchema.parse(process.env);
}

const env = getEnv();

const waitForService = async (
	url: string,
	retries = 20,
	interval = 3000
): Promise<void> => {
	for (let i = 0; i < retries; i++) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			console.log(
				`Waiting for service at ${url}... [${i + 1}/${retries}]`
			);
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	throw new Error(`Service at ${url} did not become ready in time`);
};

const startGateway = async () => {
	await waitForService(`${env.AUTH_URL}/health`);

	const gateway = new ApolloGateway({
		supergraphSdl: new IntrospectAndCompose({
			subgraphs: [{ name: "auth", url: `${env.AUTH_URL}/graphql` }],
		}),
		buildService({ name, url }) {
			return new RemoteGraphQLDataSource({
				url,

				willSendRequest({ request, context }) {
					console.log(`[${name}] Sending request to ${url}`);
					request.http?.headers.set(
						"x-gateway-secret",
						env.GATEWAY_SECRET
					);

					const cookie = context.req?.headers?.cookie;

					if (cookie) {
						request.http?.headers.set("cookie", cookie);
					} else {
						console.log(`[${name}] No cookie found`);
					}
				},

				async didReceiveResponse({ response, context }) {
					console.log(`[${name}] Received response`);
					const setCookie = response.http?.headers.get("set-cookie");

					if (setCookie && context?.res) {
						setCookie
							.split(",")
							.map((cookie) => cookie.trim())
							.forEach((cookie) => {
								context.res.append(
									"Set-Cookie",
									`${cookie}; HttpOnly; SameSite=Lax`
								);
							});
					}

					return response;
				},

				didEncounterError(error, fetchRequest, response, context) {
					console.error(`[${name}] Error: ${error.message}`);
					console.error(
						"Request:",
						JSON.stringify(fetchRequest, null, 2) // TODO: scrub sensitive data in production
					);
					if (response) console.error("Response:", response);
					if (context?.headers)
						console.error("Context headers:", context.headers);
				},
			});
		},
	});

	const app = express();

	app.use(cookieParser());
	app.use(cors({ origin: env.FRONTEND_DOMAIN, credentials: true }));
	app.use(express.json());

	app.use("/oauth2", (req, res) => {
		return res.redirect(env.AUTH_REDIRECT_URL + req.originalUrl);
	});
	app.use("/graphql", async (req, res, next) => {
		if (req.method === "POST") {
			const csrfHeader = req.headers["x-xsrf-token"];
			const csrfCookie = req.cookies["XSRF-TOKEN"];

			if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
				return res.status(403).json({ error: "CSRF token mismatch" });
			}

			if (!isExemptOperation(req.body)) {
				const accessToken = req.cookies.accessToken;

				if (!accessToken) {
					return res.status(401).json({
						errors: [
							{
								message: "Access token required",
								extensions: { code: "UNAUTHENTICATED" },
							},
						],
					});
				}

				const validationResult = await validateAccessToken(
					accessToken,
					env.AUTH_URL,
					env.GATEWAY_SECRET
				);

				if (!validationResult.valid) {
					return res.status(401).json({
						errors: [
							{
								message: "Invalid or expired access token",
								extensions: { code: "UNAUTHENTICATED" },
							},
						],
					});
				}
			}
		}
		next();
	});

	app.get("/csrf-token", (_req, res) => {
		const token = crypto.randomUUID();
		res.cookie("XSRF-TOKEN", token, {
			httpOnly: false,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		});
		res.json({ token });
	});

	const server = new ApolloServer({
		gateway,
		introspection: true,
		plugins: [ApolloServerPluginLandingPageLocalDefault()],
	});

	await server.start();
	app.use(
		"/graphql",
		expressMiddleware(server, {
			context: async ({ req, res }) => ({
				req,
				res,
			}),
		})
	);

	app.get("/health", (_req, res) => {
		res.status(200).send("OK");
	});

	app.listen(4000, () => {
		console.log("🚀 Apollo Gateway running at http://localhost:4000");
	});
};

startGateway().catch((err) => {
	console.error("❌ Failed to start Apollo Gateway:", err);
	process.exit(1);
});

export { isExemptOperation, startGateway, validateAccessToken, waitForService };
