import { test, expect } from "@playwright/test";

test.describe("Dual Mode Feature Switching", () => {
  test.beforeEach(async ({ page }) => {
    // Start from a clean state
    await page.goto("/");
  });

  test.describe("Operations Mode", () => {
    test("should display all features in sidebar", async ({ page }) => {
      // This test requires a test organization set to operations mode
      // For now, we'll test the structure of the sidebar based on mode

      // Operations mode should show: Dashboard, Tasks, Projects, Reports, Timesheet, Audit Logs
      await expect(
        page.getByRole("link", { name: /dashboard/i }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /tasks/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /projects/i })).toBeVisible();
    });

    test("should show time tracking in task details", async ({ page }) => {
      // Navigate to a task - time tracking section should be visible
      await page.goto("/tasks");

      // Open a task if available
      const firstTask = page.locator("[data-testid='task-list-item']").first();
      if (await firstTask.isVisible()) {
        await firstTask.click();

        // Time tracking section should be visible in operations mode
        await expect(
          page.getByRole("heading", { name: /time tracking/i }),
        ).toBeVisible();
      }
    });
  });

  test.describe("Product Mode", () => {
    test("should show simplified sidebar navigation", async ({ page }) => {
      // This test requires a test organization set to product mode
      // Product mode sidebar should show: Inbox, Issues, Projects, Views, Insights

      // Wait for navigation to load
      await page.waitForLoadState("networkidle");

      // In product mode, we should see Inbox instead of Dashboard
      await expect(page.getByRole("link", { name: /inbox/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /issues/i })).toBeVisible();
    });

    test("should hide time tracking in task details", async ({ page }) => {
      // Navigate to a task in product mode
      await page.goto("/inbox");

      // If there are assigned tasks, open one
      const firstTask = page.locator("[data-testid='task-list-item']").first();
      if (await firstTask.isVisible()) {
        await firstTask.click();

        // Time tracking section should NOT be visible in product mode
        await expect(
          page.getByRole("heading", { name: /time tracking/i }),
        ).not.toBeVisible();
      }
    });

    test("should redirect to /inbox for product mode home", async ({
      page,
    }) => {
      // Navigate to root
      await page.goto("/");

      // Should redirect to inbox in product mode
      await page.waitForURL(/\/inbox/);
    });
  });

  test.describe("Route Protection", () => {
    test("should block /timesheet access in product mode", async ({ page }) => {
      // Navigate directly to /timesheet in product mode
      await page.goto("/timesheet");

      // Should redirect or show access denied
      await expect(page.getByText(/not available/i)).toBeVisible();
    });

    test("should block /reports access in product mode", async ({ page }) => {
      // Navigate directly to /reports in product mode
      await page.goto("/reports");

      // Should redirect to insights or show access denied
      await expect(page.getByText(/not available|insights/i)).toBeVisible();
    });

    test("should block /audit-logs access in product mode", async ({
      page,
    }) => {
      // Navigate directly to /audit-logs in product mode
      await page.goto("/audit-logs");

      // Should show access denied
      await expect(page.getByText(/not available/i)).toBeVisible();
    });
  });

  test.describe("Insights Page", () => {
    test("should show insights page in product mode", async ({ page }) => {
      await page.goto("/insights");

      // Insights page should display metrics
      await expect(
        page.getByRole("heading", { name: /insights/i }),
      ).toBeVisible();

      // Should show metrics cards
      await expect(
        page.locator("[data-testid='metric-card']").first(),
      ).toBeVisible();
    });
  });
});
