import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { startStandaloneServer } from "@apollo/server/standalone";
import { z } from "zod";

const envSchema = z.object({
	AUTH_URL: z.string().url(),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
	console.error("Environment validation failed:", env.error);
	process.exit(1);
}

const gateway = new ApolloGateway({
	supergraphSdl: new IntrospectAndCompose({
		subgraphs: [{ name: "auth", url: env.data.AUTH_URL }],
	}),
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
		} catch (err) {
			console.log(
				`Waiting for service at ${url}... [${i + 1}/${retries}]`
			);
		}
		await new Promise((r) => setTimeout(r, interval));
	}
	throw new Error(`Service at ${url} did not become ready in time`);
}

async function startGateway() {
	await waitForService(env.data!.AUTH_URL);

	const server = new ApolloServer({
		gateway,
		plugins: [ApolloServerPluginLandingPageLocalDefault()],
		introspection: true,
	});
	const { url } = await startStandaloneServer(server, {
		listen: { port: 4000 },
	});
	console.log(`🚀 Apollo Gateway ready at ${url}`);
}

startGateway().catch((err) => {
	console.error("Failed to start Apollo Gateway:", err);
});
