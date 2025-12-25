import { test, expect } from "@playwright/test";
import { auth } from "../src/constants";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login page", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: auth.login.loginButton }),
    ).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({
    page,
  }) => {
    await page.getByRole("button", { name: auth.login.loginButton }).click();

    // Should show validation errors
    await expect(
      page.getByText(auth.login.errors.credentialsRequired),
    ).toBeVisible();
  });

  test("should handle invalid credentials", async ({ page }) => {
    // Fill in invalid credentials
    await page.getByPlaceholder("operator_id").fill("invaliduser");
    await page.getByPlaceholder("••••••••").fill("invalidpassword");
    await page.getByRole("button", { name: auth.login.loginButton }).click();

    // Should remain on login view
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("button", { name: auth.login.loginButton }),
    ).toBeVisible();
  });
});

test.describe("Protected Routes", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access protected route
    await page.goto("/");

    // Should show login form
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from users page to login", async ({
    page,
  }) => {
    await page.goto("/users");

    await expect(
      page.getByRole("button", { name: auth.login.loginButton }),
    ).toBeVisible();
  });

  test("should redirect from login to dashboard when authenticated", async () => {
    // This test requires setting up authentication state
    // For now, we'll skip the implementation details
    test.skip();
  });
});
