import { test, expect } from "@playwright/test";
import { fa } from "../src/constants/text";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login page", async ({ page }) => {
    // Check if login form is visible
    await expect(
      page.getByRole("button", { name: fa.auth.login.loginButton }),
    ).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({
    page,
  }) => {
    // Try to submit empty form
    await page.getByRole("button", { name: fa.auth.login.loginButton }).click();

    // Should show validation errors
    await expect(
      page.getByText(fa.auth.login.errors.credentialsRequired),
    ).toBeVisible();
  });

  test("should handle invalid credentials", async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(fa.auth.login.username).fill("invaliduser");
    await page.getByLabel(fa.auth.login.password).fill("invalidpassword");
    await page.getByRole("button", { name: fa.auth.login.loginButton }).click();

    // Should show error message
    await expect(page.getByText(fa.auth.errors.invalidCredentials)).toBeVisible(
      { timeout: 5000 },
    );
  });
});

test.describe("Protected Routes", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from users page to login", async ({
    page,
  }) => {
    await page.goto("/users");

    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect from login to dashboard when authenticated", async () => {
    // This test requires setting up authentication state
    // For now, we'll skip the implementation details
    test.skip();
  });
});
