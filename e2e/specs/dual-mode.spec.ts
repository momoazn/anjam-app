import { expect, test } from "@playwright/test";

test.describe("Dual Mode Feature Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Operations Mode", () => {
    test.use({
      storageState: "playwright/.auth/user.json",
    });

    test("should display all features in sidebar", async ({ page }) => {
      await expect(
        page.getByRole("link", { name: /dashboard/i }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /tasks/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /projects/i })).toBeVisible();
    });

    test("should show time tracking in task details", async ({ page }) => {
      await page.goto("/tasks");

      const firstTask = page.locator("[data-testid='task-list-item']").first();
      if (await firstTask.isVisible()) {
        await firstTask.click();

        await expect(
          page.getByRole("heading", { name: /time tracking/i }),
        ).toBeVisible();
      }
    });

    test("should allow access to timesheet", async ({ page }) => {
      await page.goto("/timesheet");

      await expect(page).toHaveURL(/\/timesheet/);
    });

    test("should allow access to reports", async ({ page }) => {
      await page.goto("/reports");

      await expect(page).toHaveURL(/\/reports/);
    });
  });

  test.describe("Product Mode", () => {
    test.use({
      storageState: "playwright/.auth/user-product-mode.json",
    });

    test("should show simplified sidebar navigation", async ({ page }) => {
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("link", { name: /inbox/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /issues/i })).toBeVisible();
    });

    test("should hide time tracking in task details", async ({ page }) => {
      await page.goto("/inbox");

      const firstTask = page.locator("[data-testid='task-list-item']").first();
      if (await firstTask.isVisible()) {
        await firstTask.click();

        await expect(
          page.getByRole("heading", { name: /time tracking/i }),
        ).not.toBeVisible();
      }
    });

    test("should redirect to /inbox for product mode home", async ({
      page,
    }) => {
      await page.goto("/");

      await page.waitForURL(/\/inbox/);
    });
  });

  test.describe("Route Protection - Product Mode", () => {
    test.use({
      storageState: "playwright/.auth/user-product-mode.json",
    });

    test("should redirect /timesheet to /inbox in product mode", async ({
      page,
    }) => {
      await page.goto("/timesheet");

      await page.waitForURL(/\/inbox/);
    });

    test("should redirect /reports to /insights in product mode", async ({
      page,
    }) => {
      await page.goto("/reports");

      await page.waitForURL(/\/insights/);
    });

    test("should redirect /audit-logs to /inbox in product mode", async ({
      page,
    }) => {
      await page.goto("/audit-logs");

      await page.waitForURL(/\/inbox/);
    });
  });

  test.describe("Insights Page - Product Mode", () => {
    test.use({
      storageState: "playwright/.auth/user-product-mode.json",
    });

    test("should show insights page in product mode", async ({ page }) => {
      await page.goto("/insights");

      await expect(
        page.getByRole("heading", { name: /insights/i }),
      ).toBeVisible();

      await expect(
        page.locator("[data-testid='metric-card']").first(),
      ).toBeVisible();
    });
  });

  test.describe("Mode Switching", () => {
    test.use({
      storageState: "playwright/.auth/user.json",
    });

    test("should switch between operations and product mode navigation", async ({
      page,
    }) => {
      await page.goto("/");

      const dashboardVisible = await page
        .getByRole("link", { name: /dashboard/i })
        .isVisible();
      const inboxVisible = await page
        .getByRole("link", { name: /inbox/i })
        .isVisible();

      if (dashboardVisible) {
        await expect(
          page.getByRole("link", { name: /dashboard/i }),
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: /reports/i }),
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: /timesheet/i }),
        ).toBeVisible();
      } else if (inboxVisible) {
        await expect(page.getByRole("link", { name: /inbox/i })).toBeVisible();
        await expect(
          page.getByRole("link", { name: /insights/i }),
        ).toBeVisible();
      }
    });
  });
});
