import { expect, test } from "@playwright/test";

test.describe("Authentication - Register (US-001)", () => {
  test("user should register with valid email and password", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testEmail = `e2etest_${timestamp}@example.com`;
    const testPassword = "TestPassword123!";
    const testOrgName = `E2E Org ${timestamp}`;

    // Navigate to register page
    await page.goto("/register");

    // Fill registration form
    await page.getByPlaceholder(/ایمیل|email/i).fill(testEmail);
    await page
      .getByPlaceholder(/رمز عبور|password/i)
      .first()
      .fill(testPassword);
    await page
      .getByPlaceholder(/تکرار رمز|confirm password/i)
      .fill(testPassword);
    await page
      .getByPlaceholder(/نام سازمان|organization name/i)
      .fill(testOrgName);

    // Submit form
    await page.getByRole("button", { name: /ثبت نام|register/i }).click();

    // Should redirect to onboarding or dashboard
    await page.waitForURL(/\/(onboarding|dashboard)/);

    // Verify we're logged in (storage state set)
    await expect(
      page.locator('[data-testid="user-menu-trigger"]'),
    ).toBeVisible();
  });

  test("user should see error with invalid email format", async ({ page }) => {
    await page.goto("/register");

    await page.getByPlaceholder(/ایمیل|email/i).fill("notanemail");
    await page
      .getByPlaceholder(/رمز عبور|password/i)
      .first()
      .fill("ValidPass123!");
    await page
      .getByPlaceholder(/تکرار رمز|confirm password/i)
      .fill("ValidPass123!");
    await page
      .getByPlaceholder(/نام سازمان|organization name/i)
      .fill("Test Org");

    // Check for validation error
    const emailInput = page.getByPlaceholder(/ایمیل|email/i);
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  test("user should see error with short password", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();

    await page
      .getByPlaceholder(/ایمیل|email/i)
      .fill(`shortpass_${timestamp}@example.com`);
    await page
      .getByPlaceholder(/رمز عبور|password/i)
      .first()
      .fill("short");

    // Check for password validation error
    const passwordInput = page.getByPlaceholder(/رمز عبور|password/i).first();
    await expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  });

  test("user should see error when passwords do not match", async ({
    page,
  }) => {
    await page.goto("/register");

    const timestamp = Date.now();

    await page
      .getByPlaceholder(/ایمیل|email/i)
      .fill(`nomatch_${timestamp}@example.com`);
    await page
      .getByPlaceholder(/رمز عبور|password/i)
      .first()
      .fill("ValidPass123!");
    await page
      .getByPlaceholder(/تکرار رمز|confirm password/i)
      .fill("DifferentPass123!");

    // Should show error
    await expect(
      page.locator("text=/رمزهای عبور|passwords do not|do not match/i"),
    ).toBeVisible();
  });

  test("user should see error with duplicate email", async ({ page }) => {
    await page.goto("/register");

    // Try to register with existing email
    await page.getByPlaceholder(/ایمیل|email/i).fill("admin@example.com");
    await page
      .getByPlaceholder(/رمز عبور|password/i)
      .first()
      .fill("ValidPass123!");
    await page
      .getByPlaceholder(/تکرار رمز|confirm password/i)
      .fill("ValidPass123!");
    await page
      .getByPlaceholder(/نام سازمان|organization name/i)
      .fill("Test Org");

    await page.getByRole("button", { name: /ثبت نام|register/i }).click();

    // Should show error about duplicate email
    await expect(
      page.locator("text=/ایمیل تکراری|email already|duplicate/i"),
    ).toBeVisible();
  });

  test("registered user should be able to login immediately", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testEmail = `e2elogin_${timestamp}@example.com`;
    const testPassword = "TestPassword123!";

    // Register
    await page.goto("/register");
    await page.getByPlaceholder(/ایمیل|email/i).fill(testEmail);
    await page
      .getByPlaceholder(/رمز عبور|password/i)
      .first()
      .fill(testPassword);
    await page
      .getByPlaceholder(/تکرار رمز|confirm password/i)
      .fill(testPassword);
    await page
      .getByPlaceholder(/نام سازمان|organization name/i)
      .fill(`E2E Org ${timestamp}`);
    await page.getByRole("button", { name: /ثبت نام|register/i }).click();

    // Should be logged in
    await page.waitForURL(/\/(onboarding|dashboard)/);

    // Logout
    await page.locator('[data-testid="user-menu-trigger"]').click();
    await page.getByRole("menuitem", { name: /خروج|logout/i }).click();

    // Should be redirected to login
    await page.waitForURL("/login");

    // Login with registered credentials
    await page.getByPlaceholder(/ایمیل|email/i).fill(testEmail);
    await page.getByPlaceholder(/رمز عبور|password/i).fill(testPassword);
    await page.getByRole("button", { name: /ورود|login/i }).click();

    // Should be logged in successfully
    await page.waitForURL(/\/(dashboard|select-organization)/);
  });

  test("user should be redirected to onboarding after first login", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testEmail = `e2eonboarding_${timestamp}@example.com`;
    const testPassword = "TestPassword123!";

    await page.goto("/register");
    await page.getByPlaceholder(/ایمیل|email/i).fill(testEmail);
    await page
      .getByPlaceholder(/رمز عبور|password/i)
      .first()
      .fill(testPassword);
    await page
      .getByPlaceholder(/تکرار رمز|confirm password/i)
      .fill(testPassword);
    await page
      .getByPlaceholder(/نام سازمان|organization name/i)
      .fill(`E2E Org ${timestamp}`);
    await page.getByRole("button", { name: /ثبت نام|register/i }).click();

    // Should show onboarding or go to dashboard
    await page.waitForURL(/\/(onboarding|dashboard)/);
  });
});
