import { test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Settings", () => {
  test("settings page renders", async ({ page }) => {
    await page.goto("/settings");
    await expectPageReady(page, /\/settings/, '[data-testid="settings-page"]');
  });

  test("preferences page renders", async ({ page }) => {
    await page.goto("/settings/preferences");
    await expectPageReady(
      page,
      /\/settings\/preferences/,
      '[data-testid="preferences-page"]',
    );
  });
});
