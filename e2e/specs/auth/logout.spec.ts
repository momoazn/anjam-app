import { expect, test } from "../../fixtures/auth";
import { TEST_USERS } from "../../fixtures/test-data";
import { DashboardPage } from "../../pages/dashboard.page";

test.describe("Authentication - Logout (US-004)", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.getByPlaceholder(/ایمیل|email/i).fill(TEST_USERS.manager.email);
    await page
      .getByPlaceholder(/رمز عبور|password/i)
      .fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();

    await page.waitForURL(/\/(dashboard|select-organization|onboarding)/);

    // Select organization if needed
    const orgSelector = page
      .locator('[role="button"]')
      .filter({ has: page.locator("text=/[A-Z]{3}/") });
    const orgCount = await orgSelector.count();
    if (orgCount > 0) {
      await orgSelector.first().click();
      await page.waitForURL(/\/dashboard/);
    }
  });

  test("user should be able to logout from dashboard", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Verify on dashboard
    await dashboardPage.expectVisible();

    // Click logout
    await dashboardPage.clickLogout();

    // Should redirect to login
    await dashboardPage.expectRedirectToLogin();
  });

  test("user should be unable to access protected routes after logout", async ({
    page,
  }) => {
    // Logout
    await page.locator('[data-testid="user-menu-trigger"]').click();
    await page.getByRole("menuitem", { name: /خروج|logout/i }).click();

    // Wait for redirect to login
    await page.waitForURL("/login");

    // Try to access dashboard directly
    await page.goto("/dashboard");

    // Should be redirected to login
    await expect(page).toHaveURL("/login");
  });

  test("user should require login again after logout", async ({ page }) => {
    // Logout
    await page.locator('[data-testid="user-menu-trigger"]').click();
    await page.getByRole("menuitem", { name: /خروج|logout/i }).click();

    // Wait for redirect to login
    await page.waitForURL("/login");

    // Login again with same credentials
    await page.getByPlaceholder(/ایمیل|email/i).fill(TEST_USERS.manager.email);
    await page
      .getByPlaceholder(/رمز عبور|password/i)
      .fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();

    // Should redirect to dashboard
    await page.waitForURL(/\/(dashboard|select-organization)/);

    // Verify logged in
    await expect(
      page.locator('[data-testid="user-menu-trigger"]'),
    ).toBeVisible();
  });

  test("logout should clear session storage", async ({ page }) => {
    // Logout
    await page.locator('[data-testid="user-menu-trigger"]').click();
    await page.getByRole("menuitem", { name: /خروج|logout/i }).click();

    await page.waitForURL("/login");

    // After logout, localstorage/session should be cleared
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter((c) => c.name.includes("auth"));

    // Auth cookies should be removed or expired
    expect(
      authCookies.length === 0 ||
        authCookies.every((c) => c.expires && c.expires < Date.now() / 1000),
    ).toBeTruthy();
  });

  test("user should see logout button in user menu", async ({ page }) => {
    // Click user menu
    await page.locator('[data-testid="user-menu-trigger"]').click();

    // Should see logout option
    await expect(
      page.getByRole("menuitem", { name: /خروج|logout/i }),
    ).toBeVisible();
  });

  test("user should remain logged in when navigating between pages", async ({
    page,
  }) => {
    // Verify logged in on dashboard
    await expect(page).toHaveURL(/\/dashboard|\/select-organization/);

    // Navigate to different page
    await page.goto("/tasks");

    // Should still be logged in (no redirect to login)
    await expect(page).toHaveURL(/\/tasks/);
    await expect(
      page.locator('[data-testid="user-menu-trigger"]'),
    ).toBeVisible();

    // Navigate to projects
    await page.goto("/projects");

    // Should still be logged in
    await expect(page).toHaveURL(/\/projects/);
    await expect(
      page.locator('[data-testid="user-menu-trigger"]'),
    ).toBeVisible();
  });
});
