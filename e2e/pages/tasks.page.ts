import { Page, expect } from "@playwright/test";

export class TasksPage {
  constructor(private page: Page) {}

  private getTaskDialog() {
    return this.page.getByRole("dialog").last();
  }

  private getTaskTitleInput() {
    return this.page.locator('input[name="title"]').first();
  }

  async goto() {
    await this.page.goto("/tasks");
  }

  async gotoBoard() {
    await this.page.goto("/tasks/board");
  }

  async gotoCalendar() {
    await this.page.goto("/tasks/calendar");
  }

  async clickNewTask() {
    let openedTaskForm = false;

    const taskButtons = [
      this.page.locator('[data-testid="new-task-button"]'),
      this.page
        .getByRole("button", {
          name: /تسک جدید|ساخت تسک|ایجاد تسک|new task|create task/i,
        })
        .first(),
    ];

    for (const button of taskButtons) {
      const isVisible = await button
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      if (!isVisible) continue;

      await button.click();
      const isDialogReady = await this.getTaskDialog()
        .locator('input[name="title"]')
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      if (isDialogReady) {
        openedTaskForm = true;
        break;
      }
    }

    if (!openedTaskForm) {
      // Fallback path for environments where modal opening is flaky.
      await this.page.goto("/tasks/new");
      await expect(this.page).toHaveURL(/\/tasks\/new/);
    }

    await expect(this.getTaskTitleInput()).toBeVisible({ timeout: 10000 });
  }

  async fillTaskForm(data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
  }) {
    const dialog = this.getTaskDialog();
    const isDialogVisible = await dialog.isVisible().catch(() => false);
    const root = isDialogVisible ? dialog : this.page;
    const titleInput = root.locator('input[name="title"]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill(data.title);

    if (data.description) {
      await root
        .locator('textarea[name="description"]')
        .first()
        .fill(data.description);
    }

    if (data.priority) {
      await root
        .getByRole("combobox", { name: /اولویت|priority/i })
        .first()
        .click();
      await this.page.getByRole("option", { name: data.priority }).click();
    }
  }

  async selectProject(projectName: string) {
    const dialog = this.getTaskDialog();
    const root = (await dialog.isVisible().catch(() => false))
      ? dialog
      : this.page;
    const projectTrigger = root.locator('[data-slot="select-trigger"]').first();
    await expect(projectTrigger).toBeVisible();
    await projectTrigger.click();
    await this.page.getByRole("option", { name: projectName }).first().click();
  }

  async submitTask() {
    const dialog = this.page.getByRole("dialog").last();
    if (await dialog.isVisible().catch(() => false)) {
      const submitInDialog = dialog
        .locator('form button[type="submit"]')
        .first();
      await expect(submitInDialog).toBeVisible();
      await submitInDialog.click({ force: true });
      return;
    }

    const submitOnPage = this.page
      .locator('form button[type="submit"]')
      .first();
    await expect(submitOnPage).toBeVisible();
    await submitOnPage.click({ force: true });
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
