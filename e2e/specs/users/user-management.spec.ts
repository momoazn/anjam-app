import { expect, test } from "@playwright/test";

import { TEST_USERS } from "../../fixtures/test-data";

test.describe("User Management (US-040 to US-045)", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("admin should create new user", async ({ page }) => {
    await page.goto("/users");

    // Click create user
    await page
      .getByRole("button", { name: /create user|ایجاد کاربر/i })
      .click();

    // Fill form
    const email = `newuser${Date.now()}@example.com`;
    await page.getByLabel(/email|ایمیل/i).fill(email);
    await page.getByLabel(/password|رمز عبور/i).fill("password123");
    await page.getByLabel(/name|نام/i).fill("New User");
    await page
      .getByRole("combobox", { name: /role|نقش/i })
      .selectOption("employee");

    // Submit
    await page.getByRole("button", { name: /create|ایجاد/i }).click();

    // Verify
    await expect(page.getByText(email)).toBeVisible();
  });

  test("admin should view users list", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByText(TEST_USERS.admin.email)).toBeVisible();
    await expect(page.getByText(TEST_USERS.manager.email)).toBeVisible();
  });

  test("admin should toggle user active status", async ({ page }) => {
    await page.goto("/users");

    // Find a user (not admin)
    const userRow = page.getByText(TEST_USERS.employee1.email).locator("..");
    await userRow.getByRole("switch").click();

    // Verify status change
    await expect(userRow).toHaveClass(/inactive/);
  });

  test("user should view own login logs", async ({ page }) => {
    await page.goto("/settings/profile");
    await page
      .getByRole("link", { name: /login history|تاریخچه ورود/i })
      .click();
    await expect(page.getByText("Session")).toBeVisible();
  });

  test("admin should view any user login logs", async ({ page }) => {
    await page.goto("/users");
    await page.getByText(TEST_USERS.employee1.email).click();
    await page
      .getByRole("button", { name: /login logs|تاریخچه ورود/i })
      .click();
    await expect(page.getByText("Session")).toBeVisible();
  });
});
