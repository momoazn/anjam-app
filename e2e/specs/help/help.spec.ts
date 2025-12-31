import { expect, test } from "@playwright/test";

import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Help & Documentation (US-077, US-078)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.manager.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should browse help articles", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByText(/categories/i)).toBeVisible();
  });

  test("user should view help article", async ({ page }) => {
    await page.goto("/help");
    await page.getByText(/getting started/i).click();
    await expect(page.getByRole("article")).toBeVisible();
  });
});
