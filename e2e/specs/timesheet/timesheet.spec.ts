import { expect, test } from "@playwright/test";

import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Time Tracking & Timesheets (US-074 to US-076)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.manager.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should view weekly timesheet", async ({ page }) => {
    await page.goto("/timesheet");
    await expect(page.getByText(/week/i)).toBeVisible();
  });

  test("user should see time spent per task", async ({ page }) => {
    await page.goto("/timesheet");
    await expect(page.getByRole("rowheader", { name: /task/i })).toBeVisible();
  });

  test("user should see daily totals", async ({ page }) => {
    await page.goto("/timesheet");
    await expect(page.getByText(/total/i)).toBeVisible();
  });

  test("user should export timesheet as CSV", async ({ page }) => {
    await page.goto("/timesheet");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /export/i }).click();
    const download = await downloadPromise;
    await expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});
