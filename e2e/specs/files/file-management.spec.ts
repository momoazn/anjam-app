import { test, expect } from "@playwright/test";
import { TEST_USERS } from "../../fixtures/test-data";

test.describe("File Management (US-065 to US-067)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page
      .getByPlaceholder("name@company.com")
      .fill(TEST_USERS.manager.email);
    await page.getByPlaceholder("••••••••").fill(TEST_USERS.manager.password);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user should upload files", async ({ page }) => {
    // Assuming a file input is available
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: /upload/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles("path/to/file.pdf");
    await expect(page.getByText("file.pdf")).toBeVisible();
  });

  test("user should delete files", async ({ page }) => {
    await page.goto("/projects");
    // Assuming project edit view
    await page.getByRole("button", { name: /edit/i }).click();
    await page.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByText("file.pdf")).not.toBeVisible();
  });

  test("user should preview files", async ({ page }) => {
    await page.getByText("file.pdf").click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
