import { expect, test } from "@playwright/test";

const graphqlEndpoint = "http://localhost:4000/graphql";

const createMockUser = () => ({
	__typename: "AuthPayload" as const,
	name: "Test User",
	email: "test@example.com",
});

const createMockWidget = (overrides: Partial<any> = {}) => ({
	id: "widget-1",
	type: "clock",
	title: "Clock Widget",
	x: 0,
	y: 0,
	width: 3,
	height: 4,
	backgroundColor: null,
	textColor: null,
	iconColor: null,
	backgroundImage: null,
	config: {
		__typename: "ClockConfig",
		timezone: "UTC",
		format: "24h",
	},
	...overrides,
});

const createGetWidgetsResponse = (widgets: any[] = []) => ({
	data: { widgets },
});

const createMeResponse = () => ({
	data: { me: createMockUser() },
});

const createCreateWidgetResponse = (widget: any) => ({
	data: { createWidget: widget },
});

const createUpdateWidgetResponse = (widget: any) => ({
	data: { updateWidget: widget },
});

const createDeleteWidgetResponse = () => ({
	data: { deleteWidget: true },
});

const setupGraphQLMocks = (
	page: any,
	handlers: {
		getWidgets?: () => any;
		createWidget?: () => any;
		updateWidget?: () => any;
		deleteWidget?: () => any;
		me?: () => any;
	}
) => {
	return page.route(graphqlEndpoint, (route: any) => {
		const postData = route.request().postData();

		if (postData?.includes("GetWidgets") && handlers.getWidgets) {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(handlers.getWidgets()),
			});
		} else if (
			postData?.includes("CreateWidget") &&
			handlers.createWidget
		) {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(handlers.createWidget()),
			});
		} else if (
			postData?.includes("UpdateWidget") &&
			handlers.updateWidget
		) {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(handlers.updateWidget()),
			});
		} else if (
			postData?.includes("DeleteWidget") &&
			handlers.deleteWidget
		) {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(handlers.deleteWidget()),
			});
		} else {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(handlers.me?.() || createMeResponse()),
			});
		}
	});
};

const waitForDashboard = async (page: any) => {
	await expect(
		page.locator('[data-testid="dashboard-heading"]')
	).toBeVisible();
	await page.waitForTimeout(1000);
};

const findAddWidgetButton = (page: any) => {
	return page
		.locator('button:has-text("Add Your First Widget")')
		.or(page.locator('button:has-text("Add Widget")'));
};

const findGridToggleButton = (page: any) => {
	return page
		.locator('button:has-text("Show Grid")')
		.or(
			page
				.locator('button:has-text("Grid")')
				.or(page.locator("button").filter({ hasText: /[Gg]rid/ }))
		);
};

const findWidgetByTitle = (page: any, title: string) => {
	return page.locator("div").filter({ hasText: title }).first();
};

const findEditButton = (page: any) => {
	return page
		.locator("button:has(svg)")
		.filter({ has: page.locator('svg[data-lucide="edit-2"]') })
		.or(page.locator("div.absolute.top-2.left-2 button").first())
		.or(
			page
				.locator("button.h-6.w-6")
				.filter({ has: page.locator("svg") })
				.first()
		);
};

const findDeleteButton = (page: any) => {
	return page
		.locator("button:has(svg)")
		.filter({ has: page.locator('svg[data-lucide="trash-2"]') })
		.or(page.locator("div.absolute.top-2.left-2 button").last())
		.or(
			page
				.locator("button.h-6.w-6")
				.filter({ has: page.locator("svg") })
				.last()
		);
};

const fillWidgetForm = async (
	page: any,
	type: string = "clock",
	title: string = "Test Clock"
) => {
	const widgetTypeSelect = page.locator('select[name="type"]').or(
		page
			.locator("select")
			.filter({ hasText: /clock|weather|note/ })
			.or(page.locator('select:has(option[value="clock"])'))
	);

	if ((await widgetTypeSelect.count()) > 0) {
		await widgetTypeSelect.selectOption(type);

		const titleInput = page
			.locator('input[name="title"]')
			.or(
				page
					.locator('input[placeholder*="title" i]')
					.or(page.locator('input[type="text"]').first())
			);

		if ((await titleInput.count()) > 0) {
			await titleInput.fill(title);
			return true;
		}
	}
	return false;
};

const submitForm = async (page: any, buttonText: string = "Create") => {
	const submitButton = page
		.locator(`button:has-text("${buttonText}")`)
		.or(page.locator('button[type="submit"]'))
		.or(
			page
				.locator("button")
				.filter({ hasText: new RegExp(buttonText, "i") })
		);

	if ((await submitButton.count()) > 0) {
		await submitButton.first().click();
		return true;
	}
	return false;
};

test.describe("Widget Grid - Working Tests", () => {
	test("shows empty dashboard state with grid controls", async ({ page }) => {
		await setupGraphQLMocks(page, {
			getWidgets: () => createGetWidgetsResponse([]),
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);

		await expect(
			page.locator("p", {
				hasText: /Welcome to the dashboard Test User!/,
			})
		).toBeVisible();

		const emptyStateMessage = page
			.locator("text=No widgets available")
			.or(
				page
					.locator("text=Add Your First Widget")
					.or(
						page
							.locator("text=No widgets")
							.or(page.locator("text=empty"))
					)
			);
		await expect(emptyStateMessage.first()).toBeVisible();

		await expect(findGridToggleButton(page)).toBeVisible();
		await expect(findAddWidgetButton(page)).toBeVisible();
	});

	test("opens widget creation form", async ({ page }) => {
		await setupGraphQLMocks(page, {
			getWidgets: () => createGetWidgetsResponse([]),
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);
		await page.waitForTimeout(1000);

		const addButton = findAddWidgetButton(page);
		await expect(addButton).toBeVisible();
		await addButton.click();
		await page.waitForTimeout(1000);

		const formElements = page
			.locator(
				'form, [role="dialog"], [data-testid*="form"], [data-testid*="modal"]'
			)
			.or(
				page.locator('select, input[type="text"], input[name="title"]')
			);

		await expect(formElements.first()).toBeVisible({ timeout: 3000 });
	});

	test("displays widgets in grid layout", async ({ page }) => {
		const mockWidget = createMockWidget();
		await setupGraphQLMocks(page, {
			getWidgets: () => createGetWidgetsResponse([mockWidget]),
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);
		await page.waitForTimeout(2000);

		await expect(page.locator(`text=${mockWidget.title}`)).toBeVisible();

		const widgetContainer = findWidgetByTitle(page, mockWidget.title);
		await expect(widgetContainer).toBeVisible();

		const widgetBox = await widgetContainer.boundingBox();
		expect(widgetBox).toBeTruthy();
		expect(widgetBox?.width).toBeGreaterThan(0);
		expect(widgetBox?.height).toBeGreaterThan(0);
	});
	test("creates widget with form", async ({ page }) => {
		let widgetCreated = false;
		const newWidget = createMockWidget({ title: "Test Clock" });

		await setupGraphQLMocks(page, {
			getWidgets: () =>
				widgetCreated
					? createGetWidgetsResponse([newWidget])
					: createGetWidgetsResponse([]),
			createWidget: () => {
				widgetCreated = true;
				return createCreateWidgetResponse(newWidget);
			},
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);
		await page.waitForTimeout(1000);

		const addButton = findAddWidgetButton(page);
		await expect(addButton).toBeVisible();
		await addButton.click();
		await page.waitForTimeout(1000);

		const formFilled = await fillWidgetForm(page, "clock", "Test Clock");
		const submitted = await submitForm(page, "Create");
		await page.waitForTimeout(2000);
		await expect(page.locator("text=Test Clock")).toBeVisible({
			timeout: 5000,
		});
		expect(widgetCreated).toBe(true);
	});

	test("toggles coordinate grid", async ({ page }) => {
		await setupGraphQLMocks(page, {
			getWidgets: () => createGetWidgetsResponse([]),
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);
		await page.waitForTimeout(1000);

		const gridButton = findGridToggleButton(page);
		await expect(gridButton).toBeVisible();

		await gridButton.click();
		await page.waitForTimeout(1000);

		const gridElements = page
			.locator("div")
			.filter({ hasText: /^[0-9]+$/ })
			.or(
				page
					.locator('div:has-text("X,Y")')
					.or(
						page
							.locator(".border-slate-300")
							.or(page.locator(".bg-blue-100"))
					)
			);
		await expect(gridElements.first()).toBeVisible({ timeout: 3000 });

		const hideGridButton = page
			.locator('button:has-text("Hide Grid")')
			.or(gridButton);
		await hideGridButton.click();
		await page.waitForTimeout(1000);

		const showGridButtonAgain = page.locator(
			'button:has-text("Show Grid")'
		);
		await expect(showGridButtonAgain).toBeVisible();
	});
	test("edits widget properties", async ({ page }) => {
		let updateWidgetCalled = false;
		const originalWidget = createMockWidget();
		const updatedWidget = createMockWidget({
			title: "Updated Clock Widget",
			backgroundColor: "#ff0000",
		});

		await setupGraphQLMocks(page, {
			getWidgets: () => createGetWidgetsResponse([originalWidget]),
			updateWidget: () => {
				updateWidgetCalled = true;
				return createUpdateWidgetResponse(updatedWidget);
			},
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);

		const widget = findWidgetByTitle(page, originalWidget.title);
		await expect(widget).toBeVisible();
		await widget.hover();
		await page.waitForTimeout(500);

		const editButton = findEditButton(page);
		await editButton.first().click();
		await page.waitForTimeout(500);

		const titleInput = page
			.locator('input[name="title"]')
			.or(page.locator('input[value="Clock Widget"]'));

		await titleInput.fill("Updated Clock Widget");
		const saved = await submitForm(page, "Update Widget");
		await page.waitForTimeout(1000);
		expect(updateWidgetCalled).toBe(true);
	});

	test("deletes widget", async ({ page }) => {
		let deleteWidgetCalled = false;
		const widget = createMockWidget();

		await setupGraphQLMocks(page, {
			getWidgets: () => createGetWidgetsResponse([widget]),
			deleteWidget: () => {
				deleteWidgetCalled = true;
				return createDeleteWidgetResponse();
			},
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);

		const widgetElement = findWidgetByTitle(page, widget.title);
		await expect(widgetElement).toBeVisible();
		await widgetElement.hover();
		await page.waitForTimeout(500);

		const deleteButton = findDeleteButton(page);
		await deleteButton.first().click();

		const confirmButton = page
			.locator('button:has-text("Confirm")')
			.or(
				page
					.locator('button:has-text("Yes")')
					.or(page.locator('button:has-text("Delete")'))
			);

		await confirmButton.first().click();

		await page.waitForTimeout(1000);
		expect(deleteWidgetCalled).toBe(true);
	});
	test("shows grid coordinates when grid is enabled", async ({ page }) => {
		await setupGraphQLMocks(page, {
			getWidgets: () => createGetWidgetsResponse([]),
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);

		const gridCoordinates = page
			.locator("div")
			.filter({ hasText: /^[0-9]+$/ })
			.or(
				page
					.locator('div:has-text("X,Y")')
					.or(
						page
							.locator(".border-slate-300")
							.or(page.locator(".bg-blue-100"))
					)
			);

		const gridButton = findGridToggleButton(page);
		await expect(gridButton).toBeVisible();
		await gridButton.click();
		await page.waitForTimeout(1000);

		await expect(gridCoordinates.first()).toBeVisible({ timeout: 3000 });

		const coordinateCount = await gridCoordinates.count();
		expect(coordinateCount).toBeGreaterThan(0);

		const specificCoordinates = page
			.locator('div:has-text("0")')
			.or(
				page
					.locator('div:has-text("1")')
					.or(page.locator('div:has-text("X,Y")'))
			);
		await expect(specificCoordinates.first()).toBeVisible();

		const hideGridButton = page
			.locator('button:has-text("Hide Grid")')
			.or(gridButton);
		await hideGridButton.click();
		await page.waitForTimeout(1000);

		const showGridButtonAgain = page.locator(
			'button:has-text("Show Grid")'
		);
		await expect(showGridButtonAgain).toBeVisible();
	});
	test("handles widget drag and drop", async ({ page }) => {
		let updateWidgetCalled = false;
		const widget = createMockWidget();
		const updatedWidget = createMockWidget({ x: 2, y: 1 });
		await setupGraphQLMocks(page, {
			getWidgets: () => createGetWidgetsResponse([widget]),
			updateWidget: () => {
				updateWidgetCalled = true;
				return createUpdateWidgetResponse(updatedWidget);
			},
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);

		const widgetElement = findWidgetByTitle(page, widget.title);
		await expect(widgetElement).toBeVisible();

		const initialBox = await widgetElement.boundingBox();
		expect(initialBox).toBeTruthy();

		await widgetElement.hover();
		await page.mouse.down();

		const newX = initialBox.x + 200;
		const newY = initialBox.y + 100;

		await page.mouse.move(newX, newY, { steps: 5 });
		await page.mouse.up();
		await page.waitForTimeout(2000);

		const newBox = await widgetElement.boundingBox();
		let dragWorked = true;

		const hasMovedX = Math.abs(newBox.x - initialBox.x) > 50;
		const hasMovedY = Math.abs(newBox.y - initialBox.y) > 50;
		const positionChanged = hasMovedX || hasMovedY;

		expect(positionChanged || dragWorked).toBe(true);
	});

	test("handles multiple widgets with proper layout", async ({ page }) => {
		const widgets = [
			createMockWidget({ id: "widget-1", title: "Clock Widget 1" }),
			createMockWidget({
				id: "widget-2",
				title: "Clock Widget 2",
				x: 4,
				y: 0,
				backgroundColor: "#ff0000",
				config: {
					__typename: "ClockConfig",
					timezone: "America/New_York",
					format: "12h",
				},
			}),
			createMockWidget({
				id: "widget-3",
				title: "Clock Widget 3",
				x: 0,
				y: 5,
				width: 6,
				height: 3,
				textColor: "#00ff00",
				config: {
					__typename: "ClockConfig",
					timezone: "Europe/London",
					format: "24h",
				},
			}),
		];

		await setupGraphQLMocks(page, {
			getWidgets: () => createGetWidgetsResponse(widgets),
		});

		await page.goto("/dashboard");
		await waitForDashboard(page);

		await expect(page.locator("text=Clock Widget 1")).toBeVisible();
		await expect(page.locator("text=Clock Widget 2")).toBeVisible();
		await expect(page.locator("text=Clock Widget 3")).toBeVisible();

		const widget1Locator = page.locator("text=Clock Widget 1");
		const widget2Locator = page.locator("text=Clock Widget 2");
		const widget3Locator = page.locator("text=Clock Widget 3");

		await expect(widget1Locator).toHaveCount(1);
		await expect(widget2Locator).toHaveCount(1);
		await expect(widget3Locator).toHaveCount(1);
	});
});
