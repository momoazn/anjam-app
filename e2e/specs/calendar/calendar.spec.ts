import { expect, test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Calendar", () => {
  test("calendar page renders", async ({ page }) => {
    await page.goto("/tasks/calendar");
    await expectPageReady(
      page,
      /\/tasks\/calendar/,
      '[data-testid="task-calendar-page"]',
    );
    await expect(
      page.locator('[data-testid="task-calendar-grid"]'),
    ).toBeVisible();
  });

  test("calendar keeps quick-create affordance", async ({ page }) => {
    await page.goto("/tasks/calendar");
    await expectPageReady(
      page,
      /\/tasks\/calendar/,
      '[data-testid="task-calendar-page"]',
    );
    await expect(
      page.locator('[data-testid="calendar-new-task-label"]'),
    ).toBeVisible();
  });
});
