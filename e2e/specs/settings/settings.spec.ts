import { test, expect } from "@playwright/test";
import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Settings & Preferences (US-048 to US-053)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.manager.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should update profile information", async ({ page }) => {
    await page.goto("/settings/profile");

    await page.getByLabel(/name/i).fill("Updated Manager Name");
    await page.getByRole("button", { name: /save/i }).click();

    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test("user should change password", async ({ page }) => {
    await page.goto("/settings/security");

    await page.getByLabel(/current password/i).fill("manager123");
    await page.getByLabel(/new password/i).fill("NewPassword123");
    await page.getByLabel(/confirm password/i).fill("NewPassword123");
    await page.getByRole("button", { name: /change password/i }).click();

    await expect(page.getByText(/password changed/i)).toBeVisible();
  });

  test("user should change application theme", async ({ page }) => {
    await page.goto("/settings/appearance");

    await page.getByRole("button", { name: /dark/i }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("user should configure timezone", async ({ page }) => {
    await page.goto("/settings/preferences");

    await page.getByRole("combobox", { name: /timezone/i }).selectOption("UTC");

    await page.getByRole("button", { name: /save/i }).click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test("user should toggle activity feed visibility", async ({ page }) => {
    await page.goto("/settings/preferences");

    await page.getByRole("switch", { name: /show activity feed/i }).click();

    await page.goto("/tasks/6xvu5hm1t1cysum"); // Go to a task
    await expect(page.getByText(/activity/i)).not.toBeVisible();
  });
});
