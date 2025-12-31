import { expect, test } from "@playwright/test";

import { TEST_USERS } from "../../fixtures/test-data";

test.describe("UI State Actions (US-068 to US-070)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.manager.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should toggle sidebar", async ({ page }) => {
    await page.getByRole("button", { name: /toggle sidebar/i }).click();
    await expect(page.locator("aside")).toBeHidden();
  });

  test("user should undo action", async ({ page }) => {
    // Assuming a delete action triggers a toast with undo
    await page.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByText(/undo/i)).toBeVisible();
    await page.getByText(/undo/i).click();
    // Verify restoration
  });

  test("user should dismiss notifications", async ({ page }) => {
    // Trigger a notification
    await page.getByRole("button", { name: /save/i }).click();
    await expect(page.locator("data-testid=toast")).toBeVisible();
    await page.getByRole("button", { name: /close/i }).click();
    await expect(page.locator("data-testid=toast")).toBeHidden();
  });
});
