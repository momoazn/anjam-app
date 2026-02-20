import { Page, expect } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/inbox");
  }

  async expectVisible() {
    await expect(this.page).toHaveURL(/\/(inbox|dashboard)/, {
      timeout: 5000,
    });
    await expect(
      this.page.locator('[data-testid="user-menu-trigger"]'),
    ).toBeVisible({
      timeout: 5000,
    });
  }

  async getTaskStats() {
    const totalElement = this.page.locator('[data-testid="task-stats-total"]');
    const completedElement = this.page.locator(
      '[data-testid="task-stats-completed"]',
    );
    const inProgressElement = this.page.locator(
      '[data-testid="task-stats-in-progress"]',
    );

    return {
      total: await totalElement.textContent(),
      completed: await completedElement.textContent(),
      inProgress: await inProgressElement.textContent(),
    };
  }

  async getProjectCount() {
    const projects = this.page.locator('[data-testid="project-card"]');
    return await projects.count();
  }

  async clickLogout() {
    // Click user avatar/menu
    const userMenu = this.page.locator('[data-testid="user-menu-trigger"]');
    await userMenu.click();

    // Click logout option
    await this.page.locator('[data-testid="logout-menu-item"]').click();
  }

  async expectRedirectToLogin() {
    await this.page.waitForURL("/login");
  }
}
