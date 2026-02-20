import { expect, test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Tags", () => {
  test("tags page renders", async ({ page }) => {
    await page.goto("/tags");
    await expectPageReady(page, /\/tags/, '[data-testid="tags-page"]');
  });

  test("tag dialog can be opened", async ({ page }) => {
    await page.goto("/tags");
    await expectPageReady(page, /\/tags/, '[data-testid="tags-page"]');

    await page.locator('[data-testid="new-tag-button"]').click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
  });
});
