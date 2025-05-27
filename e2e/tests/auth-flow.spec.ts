import { expect, test } from "@playwright/test";

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
	expect(page.url()).toContain("/login");
});

test("dashboard shows welcome message with user name", async ({
	page,
	context,
}) => {
	await context.addCookies([
		{
			name: "accessToken",
			value: "test-token",
			domain: "localhost",
			path: "/",
			httpOnly: false,
			secure: false,
			sameSite: "Lax",
		},
	]);
	await page.route("**/me/", (route) => {
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				name: "Test User",
				email: "test@example.com",
			}),
		});
	});
	await page.goto("/dashboard");
	await expect(
		page.getByRole("heading", { name: /dashboard/i })
	).toBeVisible();
	await expect(
		page.getByText(/welcome to the dashboard test user/i)
	).toBeVisible();
});
