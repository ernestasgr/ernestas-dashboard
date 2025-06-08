import {
	ApolloGateway,
	IntrospectAndCompose,
	RemoteGraphQLDataSource,
} from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import cors from "cors";
import express from "express";
import { z } from "zod";

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
					const xsrf = context.req?.headers["x-xsrf-token"];

					if (cookie) {
						request.http?.headers.set("cookie", cookie);
					} else {
						console.log(`[${name}] No cookie found`);
					}

					if (xsrf) {
						request.http?.headers.set("x-xsrf-token", xsrf);
					}
				},

				async didReceiveResponse({ response, context }) {
					console.log(`[${name}] Received response`);
					const rawSetCookies =
						response.http?.headers
							// @ts-ignore – `raw` exists in node-fetch’s type but not in dom lib
							.raw?.()["set-cookie"] ??
						(response.http?.headers.get("set-cookie")
							? [response.http.headers.get("set-cookie")]
							: []);

					if (rawSetCookies.length && context?.res) {
						rawSetCookies.forEach((cookie: string) =>
							(context.res as express.Response).append(
								"Set-Cookie",
								`${cookie}; HttpOnly; SameSite=Lax`
							)
						);
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

	app.use(cors({ origin: env.FRONTEND_DOMAIN, credentials: true }));
	app.use(express.json());

	app.use(
		(
			req: express.Request,
			res: express.Response,
			next: express.NextFunction
		) => {
			if (req.path.startsWith("/oauth2")) {
				return res.redirect(env.AUTH_REDIRECT_URL + req.originalUrl);
			}
			next();
		}
	);

	const server = new ApolloServer({
		gateway,
		introspection: true,
		plugins: [ApolloServerPluginLandingPageLocalDefault()],
	});

	await server.start();

	app.use(
		"/graphql",
		expressMiddleware(server, {
			context: async ({ req, res }) => ({ req, res }),
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

// Export for testing
export { startGateway, waitForService };
