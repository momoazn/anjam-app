import { expect, test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Dashboard Navigation", () => {
  test("inbox dashboard renders", async ({ page }) => {
    await page.goto("/inbox");
    await expectPageReady(
      page,
      /\/(inbox|dashboard)/,
      '[data-testid="inbox-page"]',
    );
  });

  test("legacy dashboard route resolves", async ({ page }) => {
    await page.goto("/dashboard");
    await expectPageReady(
      page,
      /\/(inbox|dashboard)/,
      '[data-testid="inbox-page"]',
    );
  });

  test("header controls are interactive", async ({ page }) => {
    await page.goto("/inbox");
    await expectPageReady(
      page,
      /\/(inbox|dashboard)/,
      '[data-testid="inbox-page"]',
    );

    await page.locator('[data-testid="theme-toggle"]').click();
    await expect(
      page.locator('[data-testid="user-menu-trigger"]'),
    ).toBeVisible();
  });
});
