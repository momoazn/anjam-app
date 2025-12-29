import { test, expect } from "@playwright/test";
import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Bulk Operations (US-060 to US-064)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.manager.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should select multiple tasks", async ({ page }) => {
    await page.goto("/tasks");

    // Enable selection mode
    await page.getByRole("button", { name: /select multiple/i }).click();

    // Select first task
    await page.getByRole("checkbox").first().check();

    // Select second task
    await page.getByRole("checkbox").nth(1).check();

    // Verify count
    await expect(page.getByText(/2 selected/i)).toBeVisible();
  });

  test("user should bulk change task status", async ({ page }) => {
    await page.goto("/tasks");
    await page.getByRole("button", { name: /select multiple/i }).click();
    await page.getByRole("checkbox").first().check();

    // Open bulk actions
    await page.getByRole("button", { name: /change status/i }).click();
    await page.getByRole("option", { name: /in progress/i }).click();

    // Verify
    await expect(page.getByText(/status updated/i)).toBeVisible();
  });

  test("user should bulk assign tasks", async ({ page }) => {
    await page.goto("/tasks");
    await page.getByRole("button", { name: /select multiple/i }).click();
    await page.getByRole("checkbox").first().check();

    // Open bulk actions
    await page.getByRole("button", { name: /assign/i }).click();
    await page.getByRole("option", { name: TEST_USERS.employee1.name }).click();

    // Verify
    await expect(page.getByText(/assigned/i)).toBeVisible();
  });

  test("user should bulk delete tasks", async ({ page }) => {
    // Create a task first to delete
    const taskTitle = `Task to Delete ${Date.now()}`;
    // ... implementation of creating a task ...

    await page.goto("/tasks");
    await page.getByRole("button", { name: /select multiple/i }).click();
    await page.getByRole("checkbox").first().check();

    // Delete
    await page.getByRole("button", { name: /delete/i }).click();
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify
    await expect(page.getByText(taskTitle)).not.toBeVisible();
  });
});
