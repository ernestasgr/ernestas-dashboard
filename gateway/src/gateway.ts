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
import jwt from "jsonwebtoken";
import { z } from "zod";
import logger, {
	addRequestIdToLogger,
	createContextLogger,
	generateRequestId,
} from "./logger.ts";
import "./types.ts";

/**
 * Validates a JWT access token.
 *
 * @param token - The JWT token to validate
 * @param secret - The secret key used to sign the token
 * @returns boolean - True if the token is valid and is an access token
 */
function validateAccessToken(token: string, secret: string): boolean {
	const contextLogger = createContextLogger({
		operation: "validateAccessToken",
	});

	try {
		const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

		if (decoded.type !== "access") {
			contextLogger.warn("Token validation failed: invalid token type", {
				tokenType: decoded.type,
			});
			return false;
		}

		const now = Math.floor(Date.now() / 1000);
		if (decoded.exp && decoded.exp < now) {
			contextLogger.warn("Token validation failed: token expired", {
				expiry: decoded.exp,
				now,
				expired: true,
			});
			return false;
		}

		contextLogger.debug("Token validation successful", {
			userId: decoded.sub,
		});
		return true;
	} catch (error) {
		contextLogger.error("Token validation error", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});
		return false;
	}
}

/**
 * Checks if a GraphQL operation should be exempt from token validation.
 *
 * @param body - The request body containing the GraphQL query
 * @returns boolean - True if the operation should be exempt from validation
 */
function isExemptOperation(body: any): boolean {
	const contextLogger = createContextLogger({
		operation: "isExemptOperation",
	});

	if (!body?.query) {
		contextLogger.debug("No query found in request body");
		return false;
	}

	const query = body.query.toLowerCase().trim();

	// Allow introspection queries
	if (query.includes("__schema")) {
		contextLogger.debug("Exempting introspection query");
		return true;
	}

	if (query.includes("query") && /\bme\b/.test(query)) {
		contextLogger.debug("Exempting 'me' query");
		return true;
	}

	if (query.includes("mutation") && query.includes("refresh")) {
		contextLogger.debug("Exempting refresh mutation");
		return true;
	}

	contextLogger.debug("Operation not exempt from token validation", {
		queryPreview: query.substring(0, 100),
	});
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
	const contextLogger = createContextLogger({ operation: "getEnv" });

	const envSchema = z.object({
		AUTH_URL: z.string().url(),
		AUTH_REDIRECT_URL: z.string().url(),
		GATEWAY_SECRET: z.string(),
		FRONTEND_DOMAIN: z.string().url(),
		JWT_SECRET: z.string().min(1, "JWT secret is required"),
	});

	try {
		const env = envSchema.parse(process.env);
		contextLogger.info("Environment variables validated successfully");
		return env;
	} catch (error) {
		contextLogger.error("Environment validation failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		throw error;
	}
}

const env = getEnv();

const waitForService = async (
	url: string,
	retries = 20,
	interval = 3000
): Promise<void> => {
	const contextLogger = createContextLogger({
		operation: "waitForService",
		serviceUrl: url,
		maxRetries: retries,
	});

	contextLogger.info("Waiting for service to become ready", {
		url,
		retries,
	});

	for (let i = 0; i < retries; i++) {
		try {
			const res = await fetch(url);
			if (res.ok) {
				contextLogger.info("Service is ready", { url, attempt: i + 1 });
				return;
			}
			contextLogger.warn("Service not ready, received non-OK response", {
				url,
				attempt: i + 1,
				status: res.status,
			});
		} catch (error) {
			contextLogger.warn("Service not ready, connection failed", {
				url,
				attempt: i + 1,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	const errorMsg = `Service at ${url} did not become ready in time`;
	contextLogger.error(errorMsg, { url, totalAttempts: retries });
	throw new Error(errorMsg);
};

const startGateway = async () => {
	const contextLogger = createContextLogger({ operation: "startGateway" });

	contextLogger.info("Starting Apollo Gateway", {
		nodeEnv: process.env.NODE_ENV,
	});

	try {
		await waitForService(`${env.AUTH_URL}/health`);

		const gateway = new ApolloGateway({
			supergraphSdl: new IntrospectAndCompose({
				subgraphs: [{ name: "auth", url: `${env.AUTH_URL}/graphql` }],
			}),
			buildService({ name, url }) {
				return new RemoteGraphQLDataSource({
					url,

					willSendRequest({ request, context }) {
						const requestLogger = addRequestIdToLogger(
							context.requestId || generateRequestId()
						);
						requestLogger.info("Sending request to subgraph", {
							subgraph: name,
							url,
							operation: request.operationName,
						});

						request.http?.headers.set(
							"x-gateway-secret",
							env.GATEWAY_SECRET
						);

						const cookie = context.req?.headers?.cookie;

						if (cookie) {
							request.http?.headers.set("cookie", cookie);
							requestLogger.debug(
								"Forwarding cookies to subgraph",
								{ subgraph: name }
							);
						} else {
							requestLogger.debug("No cookies to forward", {
								subgraph: name,
							});
						}
					},

					async didReceiveResponse({ response, context }) {
						const requestLogger = addRequestIdToLogger(
							context.requestId || generateRequestId()
						);
						requestLogger.info("Received response from subgraph", {
							subgraph: name,
							status: response.http?.status,
						});

						const setCookie =
							response.http?.headers.get("set-cookie");

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
							requestLogger.debug(
								"Set cookies forwarded to client",
								{
									subgraph: name,
								}
							);
						}

						return response;
					},
					didEncounterError(error, fetchRequest, response, context) {
						const requestId =
							context?.requestId || generateRequestId();
						const requestLogger = addRequestIdToLogger(requestId);
						requestLogger.error("Subgraph request error", {
							subgraph: name,
							error: error.message,
							stack: error.stack,
							requestUrl: fetchRequest?.url,
							responseStatus: response?.status,
							method: fetchRequest?.method,
						});
					},
				});
			},
		});

		const app = express();

		app.use((req, res, next) => {
			const requestId = generateRequestId();
			req.requestId = requestId;
			res.locals.requestId = requestId;

			const requestLogger = addRequestIdToLogger(requestId);
			requestLogger.info("Incoming request", {
				method: req.method,
				url: req.originalUrl,
				userAgent: req.get("User-Agent"),
				ip: req.ip,
			});

			next();
		});

		app.use(cookieParser());
		app.use(cors({ origin: env.FRONTEND_DOMAIN, credentials: true }));
		app.use(express.json());

		app.use("/oauth2", (req, res) => {
			const requestLogger = addRequestIdToLogger(
				req.requestId || generateRequestId()
			);
			requestLogger.info("OAuth2 redirect", {
				originalUrl: req.originalUrl,
				redirectTo: env.AUTH_REDIRECT_URL + req.originalUrl,
			});
			return res.redirect(env.AUTH_REDIRECT_URL + req.originalUrl);
		});

		app.use("/graphql", async (req, res, next) => {
			const requestLogger = addRequestIdToLogger(
				req.requestId || generateRequestId()
			);

			if (req.method === "POST") {
				const csrfHeader = req.headers["x-xsrf-token"];
				const csrfCookie = req.cookies["XSRF-TOKEN"];

				if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
					requestLogger.warn("CSRF token mismatch", {
						hasHeader: !!csrfHeader,
						hasCookie: !!csrfCookie,
						tokensMatch: csrfHeader === csrfCookie,
					});
					return res
						.status(403)
						.json({ error: "CSRF token mismatch" });
				}

				if (!isExemptOperation(req.body)) {
					const accessToken = req.cookies.accessToken;

					if (!accessToken) {
						requestLogger.warn("Access token missing", {
							operation: req.body?.operationName,
							hasRefreshToken: !!req.cookies.refreshToken,
						});
						return res.status(401).json({
							errors: [
								{
									message: "Access token required",
									extensions: { code: "UNAUTHENTICATED" },
								},
							],
						});
					}

					if (!validateAccessToken(accessToken, env.JWT_SECRET)) {
						requestLogger.warn("Access token validation failed", {
							operation: req.body?.operationName,
						});
						return res.status(401).json({
							errors: [
								{
									message: "Invalid or expired access token",
									extensions: { code: "UNAUTHENTICATED" },
								},
							],
						});
					}

					requestLogger.debug("Access token validated successfully", {
						operation: req.body?.operationName,
					});
				} else {
					requestLogger.debug(
						"Operation exempt from token validation",
						{
							operation: req.body?.operationName,
						}
					);
				}
			}
			next();
		});

		app.get("/csrf-token", (req, res) => {
			const requestLogger = addRequestIdToLogger(
				req.requestId || generateRequestId()
			);
			const token = crypto.randomUUID();

			res.cookie("XSRF-TOKEN", token, {
				httpOnly: false,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
			});

			requestLogger.info("CSRF token generated");
			res.json({ token });
		});

		const server = new ApolloServer({
			gateway,
			introspection: true,
			plugins: [ApolloServerPluginLandingPageLocalDefault()],
		});

		await server.start();
		contextLogger.info("Apollo Server started successfully");

		app.use(
			"/graphql",
			expressMiddleware(server, {
				context: async ({ req, res }) => ({
					req,
					res,
					requestId: req.requestId || generateRequestId(),
				}),
			})
		);

		app.get("/health", (req, res) => {
			const requestLogger = addRequestIdToLogger(
				req.requestId || generateRequestId()
			);
			requestLogger.debug("Health check requested");
			res.status(200).send("OK");
		});

		app.listen(4000, () => {
			contextLogger.info("🚀 Apollo Gateway running", {
				port: 4000,
				url: "http://localhost:4000",
				environment: process.env.NODE_ENV || "development",
			});
		});
	} catch (error) {
		contextLogger.error("Failed to start Apollo Gateway", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});
		throw error;
	}
};

startGateway().catch((err) => {
	logger.error("❌ Failed to start Apollo Gateway", {
		error: err instanceof Error ? err.message : "Unknown error",
		stack: err instanceof Error ? err.stack : undefined,
	});
	process.exit(1);
});

export { isExemptOperation, startGateway, validateAccessToken, waitForService };
