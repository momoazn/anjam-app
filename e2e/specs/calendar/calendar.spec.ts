import { expect, test } from "@playwright/test";

import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Calendar & Scheduling (US-071 to US-073)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.manager.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should view task calendar", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.locator(".react-calendar")).toBeVisible();
  });

  test("user should navigate calendar months", async ({ page }) => {
    await page.goto("/calendar");

    await page.getByRole("button", { name: /next month/i }).click();
    await page.getByRole("button", { name: /today/i }).click();

    await expect(page.locator(".react-calendar")).toBeVisible();
  });

  test("user should see monthly task statistics", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByText(/total tasks/i)).toBeVisible();
    await expect(page.getByText(/completed/i)).toBeVisible();
  });

  test("user should view tasks on calendar date", async ({ page }) => {
    await page.goto("/calendar");
    // Click on a day with tasks
    await page.getByText("15").click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
