import { expect, test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Collaboration", () => {
  test("task details collaboration panels render", async ({ page }) => {
    await page.goto("/tasks");
    await expectPageReady(page, /\/tasks/, '[data-testid="tasks-page"]');

    const rows = page.locator('[data-testid="task-row"]');
    const rowCount = await rows.count();
    test.skip(rowCount === 0, "No task exists for collaboration smoke test");

    await rows.first().click();
    await expect(page).toHaveURL(/\/tasks\/[^/]+/);
    await expect(page.locator('[data-testid="task-details"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="task-comments-panel"]'),
    ).toBeVisible();

    const subtasksTab = page.locator('[data-slot="tabs-trigger"]').nth(1);
    await subtasksTab.click();
    await expect(
      page.locator('[data-testid="task-subtasks-panel"]'),
    ).toBeVisible();
  });
});
