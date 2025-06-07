import { expect, test } from "@playwright/test";

const graphqlEndpoint = "http://localhost:4000/graphql";

test("login page shows provider buttons", async ({ page }) => {
	await page.goto("/login");
	await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
	await expect(
		page.getByRole("button", { name: /login with google/i })
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: /login with github/i })
	).toBeVisible();
});

test("redirects to login if not authenticated", async ({ page }) => {
	const response = await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/login/);
});

test.describe("WelcomeMessage component", () => {
	test("shows loading skeleton initially", async ({ page }) => {
		await page.route(graphqlEndpoint, async (route) => {
			await new Promise((r) => setTimeout(r, 3000));
			await route.continue();
		});

		await page.goto("/dashboard");

		await expect(page.getByTestId("skeleton-title")).toBeVisible();
		await expect(page.getByTestId("skeleton-subtitle")).toBeVisible();
	});

	test("shows error message when GraphQL returns error", async ({ page }) => {
		await page.route(graphqlEndpoint, (route) => {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					errors: [{ message: "GraphQL error: Unauthorized" }],
				}),
			});
		});

		await page.goto("/dashboard");

		await expect(
			page.getByRole("heading", { name: "Error" })
		).toBeVisible();
		await expect(
			page.locator("p", { hasText: /Unauthorized/ })
		).toBeVisible();
	});

	test("shows dashboard welcome message on success", async ({ page }) => {
		await page.route(graphqlEndpoint, (route) => {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: {
						me: {
							__typename: "AuthPayload",
							name: "Alice",
							email: "alice@example.com",
						},
					},
				}),
			});
		});

		await page.goto("/dashboard");

		await expect(
			page.getByRole("heading", { name: "Dashboard" })
		).toBeVisible();
		await expect(
			page.locator("p", { hasText: /Welcome to the dashboard Alice!/ })
		).toBeVisible();
	});
});
