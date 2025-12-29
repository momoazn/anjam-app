import { test, expect } from "@playwright/test";
import { comments } from "../src/constants";

test.describe("Task Comments", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill("testuser@example.com");
    await page.getByPlaceholder("••••••••").fill("admin12345");
    await page.getByRole("button", { name: "ورود به حساب" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("US-023, US-024, US-025, US-089: Comment Lifecycle", async ({
    page,
  }) => {
    // Navigate to task details
    // Using the task ID from the database check
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
    // Find the first comment's reaction button (thumbs up)
    const thumbsUpLabel = "👍";
    await page.getByRole("button", { name: thumbsUpLabel }).first().click();

    // Verify reaction count (should be 1)
    // Note: digitsEnToFa is used in the UI, so "1" becomes "۱"
    await expect(
      page.getByRole("button", { name: thumbsUpLabel }).first(),
    ).toContainText("۱");

    // 4. Edit comment (US-025)
    // Click the dots menu for the first comment
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
