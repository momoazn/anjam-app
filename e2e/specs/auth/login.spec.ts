import { test, expect } from "../../fixtures/auth";
import { LoginPage } from "../../pages/login.page";
import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Authentication - Login (US-002)", () => {
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

    // Email format validation should show error before submit
    // Check if input has invalid state
    const emailInput = page.getByPlaceholder(/ایمیل|email/i);
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
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
    await expect(page).toHaveURL(/\/(dashboard|select-organization)/);
  });

  test("authenticated user should be redirected when visiting login page", async ({
    page,
  }) => {
    // Use the auth storage from setup
    await page.goto("/login");

    // Should redirect to dashboard if already authenticated
    // This test might need adjustment based on actual redirect behavior
    const url = page.url();
    expect(url).not.toContain("/login");
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

  test("user should be blocked after 5 failed login attempts", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    // Try to login 5 times with wrong password
    for (let i = 0; i < 5; i++) {
      await loginPage.goto();
      await loginPage.fillEmail(TEST_USERS.employee2.email);
      await loginPage.fillPassword("wrongpass");
      await loginPage.clickLogin();

      if (i < 4) {
        // Wait for error message on attempts 1-4
        await expect(
          page.locator("text=/نام کاربری یا رمز عبور|invalid/i"),
        ).toBeVisible();
      }
    }

    // On 5th attempt, user should be blocked
    await expect(
      page.locator("text=/حساب کاربری مسدود|account blocked|locked/i"),
    ).toBeVisible();
  });
});
