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

if (!process.env.AUTH_URL || !process.env.AUTH_REDIRECT_URL) {
	throw new Error("Please set AUTH_URL and AUTH_REDIRECT_URL env variables");
}

const envSchema = z.object({
	AUTH_URL: z.string().url(),
	AUTH_REDIRECT_URL: z.string().url(),
});

const env = envSchema.parse(process.env);

const gateway = new ApolloGateway({
	supergraphSdl: new IntrospectAndCompose({
		subgraphs: [{ name: "auth", url: env.AUTH_URL }],
	}),
	buildService({ name, url }) {
		return new RemoteGraphQLDataSource({
			url,
			willSendRequest({ request, context }) {
				console.log(
					`Sending request to ${name} subgraph at ${url}:`,
					JSON.stringify(request, null, 2)
				);

				if (request.http && context.headers && context.headers.cookie) {
					console.log(
						`Adding cookie to request for subgraph ${name}: ${context.headers.cookie}`
					);
					request.http.headers.set("cookie", context.headers.cookie);
				} else {
					console.log("No cookie found in context headers");
				}
			},

			async didReceiveResponse({ response, request, context }) {
				console.log(
					`Response from ${name} subgraph:`,
					JSON.stringify(response, null, 2)
				);
				return response;
			},

			didEncounterError(error, fetchRequest, response, context, request) {
				console.error(
					`Error encountered in ${name} subgraph:`,
					error.message,
					"Request details:",
					JSON.stringify(fetchRequest, null, 2)
				);
				if (response) {
					console.error("Response details:", response);
				}
				if (context?.headers) {
					console.error("Context headers:", context.headers);
				}
			},
		});
	},
});

async function waitForService(url: string, retries = 20, interval = 3000) {
	for (let i = 0; i < retries; i++) {
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: "{ _service { sdl } }" }),
			});
			if (res.ok) return;
		} catch {
			console.log(
				`Waiting for service at ${url}... [${i + 1}/${retries}]`
			);
		}
		await new Promise((r) => setTimeout(r, interval));
	}
	throw new Error(`Service at ${url} did not become ready in time`);
}

async function startGateway() {
	await waitForService(env.AUTH_URL);

	const app = express();

	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
		})
	);

	app.use(
		(
			req: express.Request,
			res: express.Response,
			next: express.NextFunction
		) => {
			if (req.path.startsWith("/oauth2")) {
				res.redirect(env.AUTH_REDIRECT_URL + req.originalUrl);
			} else {
				next();
			}
		}
	);

	const server = new ApolloServer({
		gateway,
		introspection: true,
		plugins: [ApolloServerPluginLandingPageLocalDefault()],
	});

	await server.start();

	app.use(express.json());

	app.use(
		"/graphql",
		expressMiddleware(server, {
			context: async ({ req }) => ({
				headers: req.headers,
			}),
		})
	);

	app.listen(4000, () => {
		console.log("🚀 Apollo Gateway ready at http://localhost:4000");
	});
}

startGateway().catch((e) => {
	console.error("Failed to start Apollo Gateway:", e);
	process.exit(1);
});
