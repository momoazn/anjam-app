import { test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Saved Filters", () => {
  test("views management page renders", async ({ page }) => {
    await page.goto("/views");
    await expectPageReady(
      page,
      /\/(views|saved-filters)/,
      '[data-testid="views-page"]',
    );
  });

  test("saved-filters alias resolves", async ({ page }) => {
    await page.goto("/saved-filters");
    await expectPageReady(
      page,
      /\/(views|saved-filters)/,
      '[data-testid="views-page"]',
    );
  });
});
