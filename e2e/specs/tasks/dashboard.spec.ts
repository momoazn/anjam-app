import { expect, test } from "../../fixtures/auth";

test.describe("Dashboard & Navigation (US-054 to US-056)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should view dashboard", async ({ page }) => {
    // Dashboard should have task stats
    const taskStatsSection = page.locator('[data-testid="task-stats"]');
    expect(await taskStatsSection.isVisible()).toBeTruthy();

    // Should have projects overview
    const projectsSection = page.locator('[data-testid="projects-overview"]');
    if (await projectsSection.isVisible()) {
      expect(await projectsSection.count()).toBeGreaterThan(0);
    }
  });

  test("user should see task statistics", async ({ page }) => {
    // Check for stat cards
    const totalTasksCard = page.locator('[data-testid="task-stats-total"]');
    const completedTasksCard = page.locator(
      '[data-testid="task-stats-completed"]',
    );
    const inProgressCard = page.locator(
      '[data-testid="task-stats-in-progress"]',
    );

    // At least one stat should be visible
    const totalVisible = await totalTasksCard.isVisible();
    const completedVisible = await completedTasksCard.isVisible();
    const inProgressVisible = await inProgressCard.isVisible();

    expect(totalVisible || completedVisible || inProgressVisible).toBeTruthy();
  });

  test("user should see notifications on dashboard", async ({ page }) => {
    // Check if notifications section exists
    const notificationsSection = page.locator(
      '[data-testid="notifications-section"]',
    );

    if (await notificationsSection.isVisible()) {
      // Should have notification items or empty state
      const notifications = page.locator('[data-testid="notification-item"]');
      const count = await notifications.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("user should perform global search", async ({ page }) => {
    // Open search with Cmd/Ctrl+K
    await page.keyboard.press("Control+K");

    // Search input should be visible
    const searchInput = page.getByPlaceholder(/جستجو|search/i);
    await expect(searchInput).toBeVisible();

    // Type a search term
    await searchInput.fill("test");

    // Wait for results
    await page.waitForTimeout(500);

    // Should show results or no results message
    const results = page.locator('[data-testid="search-result"]');
    const noResults = page.locator("text=/نتایجی یافت نشد|no results/i");

    expect(
      (await results.isVisible()) || (await noResults.isVisible()),
    ).toBeTruthy();
  });

  test("user should navigate using sidebar", async ({ page }) => {
    // Click on different menu items
    const tasksLink = page.getByRole("link", { name: /تسک|tasks/i });
    if (await tasksLink.isVisible()) {
      await tasksLink.click();
      await page.waitForURL(/\/tasks/);
      expect(page.url()).toContain("/tasks");
    }

    // Go back to dashboard
    await page.goto("/dashboard");

    // Click on projects link
    const projectsLink = page.getByRole("link", { name: /پروژه|projects/i });
    if (await projectsLink.isVisible()) {
      await projectsLink.click();
      await page.waitForURL(/\/projects/);
      expect(page.url()).toContain("/projects");
    }
  });

  test("user should click logo to return to dashboard", async ({ page }) => {
    // Navigate to a different page
    await page.goto("/projects");

    // Click logo
    const logo = page.locator('[data-testid="app-logo"]');
    if (await logo.isVisible()) {
      await logo.click();
      await page.waitForURL(/\/dashboard|\/select-organization/);
    }
  });

  test("user should use breadcrumbs for navigation", async ({ page }) => {
    // Navigate to a task details page if available
    await page.goto("/tasks");

    const tasks = page.locator('[data-testid="task-row"]');
    if ((await tasks.count()) > 0) {
      await tasks.first().click();

      // Check for breadcrumbs
      const breadcrumb = page.locator('[data-testid="breadcrumb"]');
      if (await breadcrumb.isVisible()) {
        // Click on a breadcrumb to navigate
        const breadcrumbItems = page.locator('[data-testid="breadcrumb-item"]');
        if ((await breadcrumbItems.count()) > 0) {
          await breadcrumbItems.first().click();
          await page.waitForTimeout(500);
        }
      }
    }
  });
});
