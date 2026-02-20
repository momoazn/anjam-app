import { expect, test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("UI State", () => {
  test("sidebar toggle is available", async ({ page }) => {
    await page.goto("/inbox");
    await expectPageReady(page, /\/inbox/, '[data-testid="inbox-page"]');

    const trigger = page.locator('[data-testid="sidebar-trigger"]');
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(trigger).toBeVisible();
  });

  test("command menu trigger works", async ({ page }) => {
    await page.goto("/inbox");
    await expectPageReady(page, /\/inbox/, '[data-testid="inbox-page"]');

    await page.locator('[data-testid="command-menu-trigger"]').click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
  });
});
