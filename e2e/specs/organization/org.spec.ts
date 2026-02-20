import { expect, test } from "../../fixtures/auth";

test.describe("Organization", () => {
  test("members page renders", async ({ page }) => {
    await page.goto("/settings/members");

    // Members routes are permission-guarded; unprivileged roles are redirected.
    await expect(page.getByText("Not Found")).toHaveCount(0);
    await expect(page).toHaveURL(/\/(settings\/members|inbox)/);
    const membersPage = page.locator('[data-testid="org-members-page"]');
    const inboxPage = page.locator('[data-testid="inbox-page"]');
    await Promise.race([
      membersPage.waitFor({ state: "visible", timeout: 15000 }),
      inboxPage.waitFor({ state: "visible", timeout: 15000 }),
    ]);
  });

  test("organization selector page is reachable", async ({ page }) => {
    await page.goto("/select-organization");
    await expect(page).toHaveURL(/\/select-organization/);
    await expect(page.locator('button[type="button"]').first()).toBeVisible();
  });
});
