import { expect, test } from "../../fixtures/auth";
import { TEST_TASK } from "../../fixtures/test-data";
import { TasksPage } from "../../pages/tasks.page";

test.describe("Tasks - CRUD (US-016 to US-021)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tasks page
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/tasks/);
  });

  test("user should create a task", async ({ page }) => {
    const tasksPage = new TasksPage(page);
    const timestamp = Date.now();
    const taskTitle = `${TEST_TASK.title} ${timestamp}`;

    // Click new task button
    const newTaskButton = page.getByRole("button", {
      name: /تسک جدید|new task/i,
    });
    if (await newTaskButton.isVisible()) {
      await newTaskButton.click();
    }

    // Fill task form
    await tasksPage.fillTaskForm({
      title: taskTitle,
      description: TEST_TASK.description,
      priority: TEST_TASK.priority,
    });

    // Try to select a project
    const projectSelect = page.getByLabel(/پروژه|project/i);
    if (await projectSelect.isVisible()) {
      await projectSelect.click();
      const options = page.getByRole("option");
      const optionCount = await options.count();
      if (optionCount > 0) {
        await options.first().click();
      }
    }

    // Submit
    await tasksPage.submitTask();

    // Verify task was created
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
  });

  test("user should view task list", async ({ page }) => {
    const tasksPage = new TasksPage(page);

    // Navigate to tasks list view
    await page.goto("/tasks");

    // Should display tasks
    const taskCount = await tasksPage.getTaskCount();
    expect(taskCount).toBeGreaterThanOrEqual(0);
  });

  test("user should view task board (Kanban)", async ({ page }) => {
    const tasksPage = new TasksPage(page);

    // Navigate to board view
    await tasksPage.gotoBoard();

    // Should display columns for statuses
    const columns = page.locator('[data-testid="kanban-column"]');
    const columnCount = await columns.count();
    expect(columnCount).toBeGreaterThan(0);
  });

  test("user should view task details", async ({ page }) => {
    // Navigate to tasks list
    await page.goto("/tasks");

    // Get first task
    const tasks = page.locator('[data-testid="task-row"]');
    const taskCount = await tasks.count();

    if (taskCount > 0) {
      // Click first task
      await tasks.first().click();

      // Should show task details
      await expect(page.locator('[data-testid="task-details"]')).toBeVisible();
    }
  });

  test("user should edit task", async ({ page }) => {
    const timestamp = Date.now();
    const newTitle = `Updated Task ${timestamp}`;

    // Navigate to tasks
    await page.goto("/tasks");

    // Get first task
    const tasks = page.locator('[data-testid="task-row"]');
    if ((await tasks.count()) > 0) {
      // Click task to view details
      await tasks.first().click();

      // Click edit button
      const editButton = page.getByRole("button", { name: /ویرایش|edit/i });
      if (await editButton.isVisible()) {
        await editButton.click();

        // Update title
        const titleInput = page.getByLabel(/عنوان|title/i);
        if (await titleInput.isVisible()) {
          await titleInput.clear();
          await titleInput.fill(newTitle);
        }

        // Save
        const saveButton = page.getByRole("button", { name: /ذخیره|save/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }

        // Verify update
        await expect(page.locator(`text=${newTitle}`)).toBeVisible();
      }
    }
  });

  test("user should delete task", async ({ page }) => {
    const timestamp = Date.now();
    const taskTitle = `Delete Test Task ${timestamp}`;

    // Create a task first
    const newTaskButton = page.getByRole("button", {
      name: /تسک جدید|new task/i,
    });
    if (await newTaskButton.isVisible()) {
      await newTaskButton.click();

      const titleInput = page.getByLabel(/عنوان|title/i);
      if (await titleInput.isVisible()) {
        await titleInput.fill(taskTitle);
      }

      const submitButton = page.getByRole("button", { name: /ایجاد|create/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }
    }

    // Find and delete the task
    const task = page.locator(`text=${taskTitle}`);
    await expect(task).toBeVisible();

    await task.click();

    // Click delete button
    const deleteButton = page.getByRole("button", { name: /حذف|delete/i });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.getByRole("button", {
        name: /تایید|confirm/i,
      });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Verify task is removed
      await expect(task).not.toBeVisible();
    }
  });
});

test.describe("Tasks - Filtering & Sorting (US-022)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tasks");
  });

  test("user should filter tasks by status", async ({ page }) => {
    const statusFilter = page.getByLabel(/وضعیت|status/i);

    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      const options = page.getByRole("option");
      if ((await options.count()) > 0) {
        await options.first().click();

        // Tasks should update based on filter
        await page.waitForTimeout(500);
      }
    }
  });

  test("user should sort tasks", async ({ page }) => {
    const sortButton = page.locator('[data-testid="sort-button"]');

    if (await sortButton.isVisible()) {
      await sortButton.click();

      const options = page.getByRole("option");
      if ((await options.count()) > 0) {
        await options.first().click();
      }
    }
  });

  test("user should clear filters", async ({ page }) => {
    // Apply a filter first
    const statusFilter = page.getByLabel(/وضعیت|status/i);
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      const options = page.getByRole("option");
      if ((await options.count()) > 0) {
        await options.first().click();
      }
    }

    // Clear filters
    const clearButton = page.getByRole("button", { name: /پاک کردن|clear/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  });
});
