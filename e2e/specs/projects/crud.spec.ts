import { expect, test } from "../../fixtures/auth";
import { expectPageReady } from "../../utils/smoke";

test.describe("Projects", () => {
  test("projects page renders", async ({ page }) => {
    await page.goto("/projects");
    await expectPageReady(page, /\/projects/, '[data-testid="projects-page"]');
  });

  test("create project modal can be opened", async ({ page }) => {
    await page.goto("/projects");
    await expectPageReady(page, /\/projects/, '[data-testid="projects-page"]');

    const newProjectButton = page.locator('[data-testid="new-project-button"]');
    if (await newProjectButton.isVisible()) {
      await newProjectButton.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
    }
  });
});
