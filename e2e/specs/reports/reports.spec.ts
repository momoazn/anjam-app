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

  test("audit logs alias routes to insights", async ({ page }) => {
    await page.goto("/audit-logs");
    await expectPageReady(
      page,
      /\/(audit-logs|insights)/,
      '[data-testid="insights-page"]',
    );
  });
});
