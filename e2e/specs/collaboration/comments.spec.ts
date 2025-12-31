import { expect, test } from "@playwright/test";

import { comments } from "../../../src/constants";
import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Task Comments (US-023, US-024, US-025, US-089)", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.admin.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.admin.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should add, reply, react, edit, and delete a comment", async ({
    page,
  }) => {
    // Navigate to task details
    // Using a known task ID or creating one would be better, but for now using a static ID
    const taskId = "6xvu5hm1t1cysum";
    await page.goto(`/tasks/${taskId}`);

    // Wait for task details to load
    await expect(page.getByText("Test Task 1 Updated")).toBeVisible();

    // 1. Add a comment (US-023)
    const commentText = `Test comment at ${new Date().toISOString()}`;
    await page
      .getByPlaceholder(comments.composer.placeholder)
      .fill(commentText);
    await page.getByRole("button", { name: comments.composer.send }).click();

    // Verify comment appears
    await expect(page.getByText(commentText)).toBeVisible();

    // 2. Reply to comment (US-024)
    await page
      .getByRole("button", { name: comments.item.reply })
      .first()
      .click();
    const replyText = `Test reply at ${new Date().toISOString()}`;
    await page.getByPlaceholder(comments.composer.placeholder).fill(replyText);
    await page.getByRole("button", { name: comments.composer.send }).click();

    // Verify reply appears
    await expect(page.getByText(replyText)).toBeVisible();

    // 3. Add a reaction (US-089)
    const thumbsUpLabel = "👍";
    await page.getByRole("button", { name: thumbsUpLabel }).first().click();

    // Verify reaction count (should be 1, note: digitsEnToFa is used)
    await expect(
      page.getByRole("button", { name: thumbsUpLabel }).first(),
    ).toContainText("۱");

    // 4. Edit comment (US-025)
    await page
      .locator(".group")
      .first()
      .locator("button")
      .filter({ has: page.locator("svg.tabler-icon-dots-vertical") })
      .click();
    await page.getByText(comments.item.edit).click();

    const editedText = `Edited comment at ${new Date().toISOString()}`;
    await page.getByPlaceholder(comments.item.editPlaceholder).fill(editedText);
    await page.getByRole("button", { name: comments.item.save }).click();

    // Verify edited text appears
    await expect(page.getByText(editedText)).toBeVisible();
    await expect(page.getByText(comments.item.edited)).toBeVisible();

    // 5. Delete comment (US-025)
    await page
      .locator(".group")
      .first()
      .locator("button")
      .filter({ has: page.locator("svg.tabler-icon-dots-vertical") })
      .click();
    await page.getByText(comments.item.delete).click();

    // Verify comment shows as deleted
    await expect(page.getByText(comments.item.deleted)).toBeVisible();
  });
});

test.describe("Subtasks (US-026, US-027)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.admin.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.admin.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should add and complete a subtask", async ({ page }) => {
    const taskId = "6xvu5hm1t1cysum";
    await page.goto(`/tasks/${taskId}`);
    await expect(page.getByText("Test Task 1 Updated")).toBeVisible();

    // Add subtask
    const subtaskTitle = `Subtask ${Date.now()}`;
    // Locate the add subtask button/input area - this depends on UI structure
    // Assuming there is an input or button for adding subtasks
    await page
      .getByRole("button", { name: /add subtask|اضافه کردن زیرتسک/i })
      .click();
    await page.getByPlaceholder(/title|عنوان/i).fill(subtaskTitle);
    await page.getByRole("button", { name: /add|ایجاد/i }).click();

    await expect(page.getByText(subtaskTitle)).toBeVisible();

    // Mark subtask as done
    await page.locator('input[type="checkbox"]').first().check();
    await expect(page.getByText(subtaskTitle)).toHaveClass(/line-through/);
  });
});

test.describe("Time Entries (US-028 to US-031)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.admin.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.admin.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should log time entry", async ({ page }) => {
    const taskId = "6xvu5hm1t1cysum";
    await page.goto(`/tasks/${taskId}`);
    await expect(page.getByText("Test Task 1 Updated")).toBeVisible();

    // Navigate to Time Entries tab
    await page.getByRole("tab", { name: /time entries|ثبت زمان/i }).click();

    // Log time
    await page.getByRole("button", { name: /log time|ثبت زمان/i }).click();
    await page.getByLabel(/hours|ساعت/i).fill("2");
    await page.getByLabel(/minutes|دقیقه/i).fill("30");
    await page.getByRole("button", { name: /save|ذخیره/i }).click();

    // Verify entry appears
    await expect(page.getByText("2h 30m")).toBeVisible();
  });
});
