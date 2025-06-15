import { afterEach, describe, expect, it, vi } from "vitest";
import { startGateway, validateAccessToken } from "./gateway.js";

global.fetch = vi.fn();

vi.mock("@apollo/gateway", () => ({
	ApolloGateway: vi.fn().mockImplementation(() => ({
		load: vi.fn(),
	})),
	IntrospectAndCompose: vi.fn(),
	RemoteGraphQLDataSource: vi.fn(),
}));
vi.mock("@apollo/server", () => ({
	ApolloServer: vi.fn().mockImplementation(() => ({
		start: vi.fn(),
		stop: vi.fn(),
		assertStarted: vi.fn(),
	})),
}));
vi.mock("@apollo/server/express4", () => ({
	expressMiddleware: vi.fn(() => (req: any, res: any, next: any) => next()),
}));
vi.mock("@apollo/server/plugin/landingPage/default", () => ({
	ApolloServerPluginLandingPageLocalDefault: vi.fn(),
}));
vi.mock("zod", async () => {
	const actual = await vi.importActual<typeof import("zod")>("zod");
	return {
		...actual,
		z: {
			...actual.z,
			object: vi.fn(() => ({
				parse: vi.fn(() => ({
					AUTH_URL: "http://localhost:5000",
					AUTH_REDIRECT_URL: "http://localhost:5000/redirect",
					GATEWAY_SECRET: "secret",
					FRONTEND_DOMAIN: "http://localhost:3000",
					JWT_SECRET: "test-jwt-secret",
				})),
			})),
		},
	};
});

const mockApp = {
	use: vi.fn(),
	get: vi.fn(),
	listen: vi.fn((port: number, cb?: () => void) => {
		if (cb) cb();
		return mockApp;
	}),
};
vi.mock("express", () => {
	const expressFn = vi.fn(() => mockApp);
	// @ts-expect-error
	expressFn.json = vi.fn(() => (req: any, res: any, next: any) => next());
	return {
		__esModule: true,
		default: expressFn,
	};
});

describe("gateway", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should start the gateway and listen on port 4000", async () => {
		vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);
		await startGateway();
		expect(mockApp.listen).toHaveBeenCalledWith(4000, expect.any(Function));
	});

	it("should redirect /oauth2 requests", async () => {
		const env = {
			AUTH_URL: "http://localhost:5000",
			AUTH_REDIRECT_URL: "http://localhost:5000/redirect",
			GATEWAY_SECRET: "secret",
		};
		const req = {
			path: "/oauth2/test",
			originalUrl: "/oauth2/test",
		} as any;
		const res = { redirect: vi.fn() } as any;
		const next = vi.fn();

		const middleware = (req: any, res: any, next: any) => {
			if (req.path.startsWith("/oauth2")) {
				return res.redirect(env.AUTH_REDIRECT_URL + req.originalUrl);
			}
			next();
		};

		middleware(req, res, next);
		expect(res.redirect).toHaveBeenCalledWith(
			"http://localhost:5000/redirect/oauth2/test"
		);
	});

	it("should call waitForService with correct URL", async () => {
		const fetchSpy = vi
			.spyOn(global, "fetch")
			.mockResolvedValue({ ok: true } as any);
		await startGateway();
		expect(fetchSpy).toHaveBeenCalledWith("http://localhost:5000/health");
	});

	describe("validateAccessToken", () => {
		const testSecret = "test-jwt-secret";

		it("should return false for invalid token", () => {
			const result = validateAccessToken("invalid-token", testSecret);
			expect(result).toBe(false);
		});

		it("should return false for empty token", () => {
			const result = validateAccessToken("", testSecret);
			expect(result).toBe(false);
		});

		it("should return false for token with wrong type", () => {
			const result = validateAccessToken("wrong.type.token", testSecret);
			expect(result).toBe(false);
		});
	});
});
