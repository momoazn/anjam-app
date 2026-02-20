import { test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Help", () => {
  test("help page renders", async ({ page }) => {
    await page.goto("/helps");
    await expectPageReady(page, /\/(helps|help)/, '[data-testid="help-page"]');
  });

  test("legacy help route resolves", async ({ page }) => {
    await page.goto("/help");
    await expectPageReady(page, /\/(helps|help)/, '[data-testid="help-page"]');
  });
});
