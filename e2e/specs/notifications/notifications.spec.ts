import { expect, test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Notifications", () => {
  test("notifications page renders", async ({ page }) => {
    await page.goto("/notifications");
    await expectPageReady(
      page,
      /\/notifications/,
      '[data-testid="notifications-page"]',
    );
  });

  test("notifications panel controls are visible", async ({ page }) => {
    await page.goto("/notifications");
    await expectPageReady(
      page,
      /\/notifications/,
      '[data-testid="notifications-page"]',
    );
    await expect(page.locator('[data-slot="button"]').first()).toBeVisible();
  });
});
