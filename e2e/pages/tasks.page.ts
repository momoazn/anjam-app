import { Page, expect } from "@playwright/test";

export class TasksPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/tasks");
  }

  async gotoBoard() {
    await this.page.goto("/tasks/board");
  }

  async gotoCalendar() {
    await this.page.goto("/calendar");
  }

  async clickNewTask() {
    await this.page.getByRole("button", { name: /تسک جدید|new task/i }).click();
  }

  async fillTaskForm(data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
  }) {
    await this.page.getByLabel(/عنوان|title/i).fill(data.title);

    if (data.description) {
      await this.page.getByLabel(/توضیح|description/i).fill(data.description);
    }

    if (data.priority) {
      await this.page.getByLabel(/اولویت|priority/i).click();
      await this.page.getByRole("option", { name: data.priority }).click();
    }
  }

  async selectProject(projectName: string) {
    await this.page.getByLabel(/پروژه|project/i).click();
    await this.page.getByRole("option", { name: projectName }).click();
  }

  async submitTask() {
    await this.page.getByRole("button", { name: /ایجاد|create/i }).click();
  }

  async expectTaskInList(taskTitle: string) {
    await expect(this.page.locator(`text=${taskTitle}`)).toBeVisible();
  }

  async clickTask(taskTitle: string) {
    await this.page.locator(`text=${taskTitle}`).first().click();
  }

  async getTaskCount() {
    const tasks = this.page.locator('[data-testid="task-row"]');
    return await tasks.count();
  }

  async filterByStatus(status: string) {
    await this.page.getByLabel(/وضعیت|status/i).click();
    await this.page.getByRole("option", { name: status }).click();
  }

  async filterByPriority(priority: string) {
    await this.page.getByLabel(/اولویت|priority/i).click();
    await this.page.getByRole("option", { name: priority }).click();
  }

  async sortBy(field: string) {
    await this.page
      .getByRole("button", { name: new RegExp(field, "i") })
      .click();
  }
}
