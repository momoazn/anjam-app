import { test, expect } from "@playwright/test";
import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Notifications (US-036 to US-039)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.admin.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.admin.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should view notifications list", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page.getByText(/notification/i)).toBeVisible();
  });

  test("user should mark notification as read", async ({ page }) => {
    await page.goto("/notifications");

    const unreadNotification = page.getByText(/unread/i).first();
    await unreadNotification.click();

    await expect(unreadNotification).toHaveClass(/read/);
  });

  test("user should delete notification", async ({ page }) => {
    await page.goto("/notifications");

    const notification = page.getByText(/test notification/i).first();
    await notification.hover();
    await page.getByRole("button", { name: /delete/i }).click();

    await expect(notification).not.toBeVisible();
  });

  test("user should see unread notification badge", async ({ page }) => {
    await expect(page.locator('[data-testid="badge"]')).toContainText(/[0-9]+/);
  });
});
