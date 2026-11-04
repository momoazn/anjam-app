import { test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Reports", () => {
  test("reports alias routes to insights", async ({ page }) => {
    await page.goto("/reports");
    await expectPageReady(
      page,
      /\/(reports|insights)/,
      '[data-testid="insights-page"]',
    );
  });
});
