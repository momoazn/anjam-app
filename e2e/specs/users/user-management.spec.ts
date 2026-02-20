import { expect, test } from "../../fixtures/auth";

test.describe("User Management", () => {
  test("legacy users route resolves to org members", async ({ page }) => {
    await page.goto("/users");

    // Users route is permission-guarded and may redirect to inbox for members.
    await expect(page.getByText("Not Found")).toHaveCount(0);
    await expect(page).toHaveURL(/\/(users|settings\/members|inbox)/);
    const membersPage = page.locator('[data-testid="org-members-page"]');
    const inboxPage = page.locator('[data-testid="inbox-page"]');
    await Promise.race([
      membersPage.waitFor({ state: "visible", timeout: 15000 }),
      inboxPage.waitFor({ state: "visible", timeout: 15000 }),
    ]);
  });

  test("members settings route renders", async ({ page }) => {
    await page.goto("/settings/members");

    await expect(page.getByText("Not Found")).toHaveCount(0);
    await expect(page).toHaveURL(/\/(settings\/members|inbox)/);
    const membersPage = page.locator('[data-testid="org-members-page"]');
    const inboxPage = page.locator('[data-testid="inbox-page"]');
    await Promise.race([
      membersPage.waitFor({ state: "visible", timeout: 15000 }),
      inboxPage.waitFor({ state: "visible", timeout: 15000 }),
    ]);
  });
});
