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
	await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/login/);
});

test.describe("WelcomeMessage component", () => {
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
});
