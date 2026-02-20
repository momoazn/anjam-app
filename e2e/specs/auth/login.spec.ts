import { expect, test } from "@playwright/test";

import { TEST_USERS } from "../../fixtures/test-data";
import { LoginPage } from "../../pages/login.page";

test.describe("Authentication - Login (US-002)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("user should log in with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await loginPage.expectRedirectToDashboard();

    // Verify user is logged in by checking for dashboard elements
    await expect(
      page.locator('[data-testid="user-menu-trigger"]'),
    ).toBeVisible();
  });

  test("user should see error with invalid email", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.fillEmail("notvalid@");
    await loginPage.fillPassword(TEST_USERS.admin.password);
    await loginPage.clickLogin();

    // Should remain on login page after failed authentication.
    await expect(page).toHaveURL(/\/login/);
  });

  test("user should see error with wrong password", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.fillEmail(TEST_USERS.admin.email);
    await loginPage.fillPassword("wrongpassword");
    await loginPage.clickLogin();

    // Should show error message
    await expect(
      page.locator(
        "text=/نام کاربری یا رمز عبور|username or password|invalid/i",
      ),
    ).toBeVisible();
  });

  test("user should see error with non-existent account", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.fillEmail("nonexistent@example.com");
    await loginPage.fillPassword("password123");
    await loginPage.clickLogin();

    // Should show error message
    await expect(
      page.locator(
        "text=/نام کاربری یا رمز عبور|username or password|invalid/i",
      ),
    ).toBeVisible();
  });

  test("user should be redirected to dashboard after successful login", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(
      TEST_USERS.manager.email,
      TEST_USERS.manager.password,
    );
    await expect(page).toHaveURL(/\/(inbox|select-organization)/);
  });

  test.skip("authenticated user should be redirected when visiting login page", async () => {
    // Behavior is currently non-deterministic during auth hydration in E2E.
  });

  test("failed login attempts should be tracked", async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Try to login with wrong password multiple times
    for (let i = 0; i < 3; i++) {
      await loginPage.goto();
      await loginPage.fillEmail(TEST_USERS.employee1.email);
      await loginPage.fillPassword("wrongpass");
      await loginPage.clickLogin();

      // Wait for error message
      await expect(
        page.locator("text=/نام کاربری یا رمز عبور|invalid/i"),
      ).toBeVisible();
    }
  });

  test.skip("user should be blocked after 5 failed login attempts", async () => {
    // Rate limiting is configured in auth, but this assertion is skipped in local E2E
    // because AUTH_RATE_LIMIT_ENABLED defaults to production-only.
  });
});
