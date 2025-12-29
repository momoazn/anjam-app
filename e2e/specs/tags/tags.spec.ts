import { test, expect } from "@playwright/test";
import { TEST_USERS, TEST_TAG } from "../../fixtures/test-data";

test.describe("Tags Management (US-032 to US-035)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.admin.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.admin.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should create a new tag", async ({ page }) => {
    await page.goto("/tags");

    // Click new tag
    await page.getByRole("button", { name: /new tag|برچسب جدید/i }).click();

    // Fill form
    const tagName = `${TEST_TAG.name}-${Date.now()}`;
    await page.getByLabel(/name|نام/i).fill(tagName);
    await page.getByLabel(/color|رنگ/i).fill(TEST_TAG.color);

    // Submit
    await page.getByRole("button", { name: /create|ایجاد/i }).click();

    // Verify
    await expect(page.getByText(tagName)).toBeVisible();
  });

  test("should edit a tag", async ({ page }) => {
    await page.goto("/tags");

    // Create a tag first if not exists, or select existing
    // Assuming a tag exists for this test
    const tagItem = page.getByText(TEST_TAG.name).first();
    await expect(tagItem).toBeVisible();

    // Click edit
    // The edit button might be in a dropdown or inline
    await tagItem.hover();
    await page.getByRole("button", { name: /edit|ویرایش/i }).click();

    // Change name
    const newTagName = `${TEST_TAG.name}-edited-${Date.now()}`;
    await page.getByLabel(/name|نام/i).fill(newTagName);
    await page.getByRole("button", { name: /save|ذخیره/i }).click();

    await expect(page.getByText(newTagName)).toBeVisible();
  });

  test("should delete a tag", async ({ page }) => {
    await page.goto("/tags");

    // Create a tag first to delete
    const tagName = `ToDelete-${Date.now()}`;
    await page.getByRole("button", { name: /new tag|برچسب جدید/i }).click();
    await page.getByLabel(/name|نام/i).fill(tagName);
    await page.getByLabel(/color|رنگ/i).fill("#000000");
    await page.getByRole("button", { name: /create|ایجاد/i }).click();

    await expect(page.getByText(tagName)).toBeVisible();

    // Delete
    await page.getByText(tagName).hover();
    await page.getByRole("button", { name: /delete|حذف/i }).click();

    // Confirm
    await page.getByRole("button", { name: /confirm|تایید/i }).click();

    // Verify deleted
    await expect(page.getByText(tagName)).not.toBeVisible();
  });

  test("should filter tasks by tag", async ({ page }) => {
    await page.goto("/tasks");

    // Open filters
    await page.getByRole("button", { name: /filter|فیلتر/i }).click();

    // Select tag
    await page.getByRole("checkbox", { name: TEST_TAG.name }).check();

    // Apply
    await page.getByRole("button", { name: /apply|اعمال/i }).click();

    // Verify
    // This depends on how the UI shows filtered tasks.
    // Often filters update the list automatically.
    await expect(page).toHaveURL(/\/tasks.*tag=/);
  });
});
