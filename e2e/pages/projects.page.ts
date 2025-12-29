import { Page, expect } from "@playwright/test";

export class ProjectsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/projects");
  }

  async clickNewProject() {
    await this.page
      .getByRole("button", { name: /پروژه جدید|new project/i })
      .click();
  }

  async fillProjectForm(data: {
    name: string;
    code?: string;
    description?: string;
  }) {
    await this.page.getByLabel(/نام|name/i).fill(data.name);

    if (data.code) {
      await this.page.getByLabel(/کد|code/i).fill(data.code);
    }

    if (data.description) {
      await this.page.getByLabel(/توضیح|description/i).fill(data.description);
    }
  }

  async submitProject() {
    await this.page.getByRole("button", { name: /ایجاد|create/i }).click();
    await this.page.waitForURL(/\/projects\/[a-z0-9]+/);
  }

  async expectProjectInList(projectName: string) {
    await expect(this.page.locator(`text=${projectName}`)).toBeVisible();
  }

  async clickProject(projectName: string) {
    await this.page.locator(`text=${projectName}`).first().click();
  }

  async getProjectCount() {
    const cards = this.page.locator('[data-testid="project-card"]');
    return await cards.count();
  }

  async deleteProject() {
    // Open project menu
    const menuButton = this.page
      .locator('[data-testid="project-menu"]')
      .first();
    await menuButton.click();

    // Click delete option
    await this.page.getByRole("menuitem", { name: /حذف|delete/i }).click();

    // Confirm deletion
    await this.page.getByRole("button", { name: /تایید|confirm/i }).click();
  }
}
