import { expect, test } from "@playwright/test";

import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Reports & Audit (US-057 to US-059, US-090, US-091)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.admin.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.admin.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("admin should view audit logs", async ({ page }) => {
    await page.goto("/audit-logs");
    await expect(page.getByText(/action|عمل/i)).toBeVisible();
  });

  test("admin should filter audit logs by resource", async ({ page }) => {
    await page.goto("/audit-logs");
    await page
      .getByRole("combobox", { name: /resource/i })
      .selectOption("tasks");
    await expect(page.getByText(/task/i)).toBeVisible();
  });

  test("admin should view field-level changes in audit logs", async ({
    page,
  }) => {
    await page.goto("/audit-logs");
    await page.getByText(/view changes/i).click();
    await expect(page.getByText(/old value|قدیمی/i)).toBeVisible();
  });

  test("admin should generate reports", async ({ page }) => {
    await page.goto("/reports");
    await page.getByRole("button", { name: /generate/i }).click();
    await expect(page.getByText(/completion rate/i)).toBeVisible();
  });

  test("admin should view employee leaderboard", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.getByText(/leaderboard/i)).toBeVisible();
  });

  test("admin should export report to Excel", async ({ page }) => {
    await page.goto("/reports");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /export/i }).click();
    const download = await downloadPromise;
    await expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });
});
