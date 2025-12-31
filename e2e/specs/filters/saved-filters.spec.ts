import { expect, test } from "@playwright/test";

import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Saved Filters (US-079 to US-081)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.manager.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should save filter", async ({ page }) => {
    await page.goto("/tasks");
    // Apply some filters
    await page.getByRole("combobox", { name: /status/i }).selectOption("todo");

    // Save filter
    await page.getByRole("button", { name: /save filter/i }).click();
    await page.getByRole("textbox", { name: /name/i }).fill("My Todo Tasks");
    await page.getByRole("button", { name: /save/i }).click();

    // Verify
    await expect(page.getByText("My Todo Tasks")).toBeVisible();
  });

  test("user should apply saved filter", async ({ page }) => {
    await page.goto("/tasks");
    await page.getByRole("button", { name: /saved filters/i }).click();
    await page.getByText("My Todo Tasks").click();

    // Verify filters applied
    await expect(page.getByRole("combobox", { name: /status/i })).toHaveValue(
      "todo",
    );
  });

  test("user should delete saved filter", async ({ page }) => {
    await page.goto("/tasks");
    await page.getByRole("button", { name: /saved filters/i }).click();
    await page.getByText("My Todo Tasks").hover();
    await page.getByRole("button", { name: /delete/i }).click();

    await expect(page.getByText("My Todo Tasks")).not.toBeVisible();
  });
});
