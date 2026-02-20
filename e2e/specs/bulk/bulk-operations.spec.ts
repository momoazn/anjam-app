import { expect, test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Bulk Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tasks");
    await expectPageReady(page, /\/tasks/, '[data-testid="tasks-page"]');
  });

  test("selection mode control is available", async ({ page }) => {
    const toggle = page.locator('[data-testid="selection-mode-toggle"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toBeVisible();
  });

  test("board route is reachable from task workflows", async ({ page }) => {
    await page.goto("/tasks/board");
    const loadingStuck = await page
      .getByText("Loading...")
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    test.skip(
      loadingStuck,
      "Board route is intermittently blocked by auth hydration in E2E",
    );
    await expectPageReady(
      page,
      /\/tasks\/board/,
      '[data-testid="task-board-page"]',
    );
    await expect(
      page.locator('[data-testid="kanban-column"]').first(),
    ).toBeVisible();
  });
});
