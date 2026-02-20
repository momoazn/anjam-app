import { expect, test } from "@playwright/test";

test.describe("Authentication - Register (US-001)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("user should register with valid email and password", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testEmail = `e2etest_${timestamp}@example.com`;
    const testPassword = "TestPassword123!";

    await page.goto("/register");
    await page.locator('input[type="email"]').first().fill(testEmail);
    await page.locator('input[type="password"]').first().fill(testPassword);
    await page.locator('input[type="password"]').nth(1).fill(testPassword);

    await page.getByRole("button", { name: /ایجاد حساب|register/i }).click();

    await page.waitForURL(/\/(onboarding|inbox|select-organization)/);
    await expect(page).not.toHaveURL(/\/register/);
  });

  test("user should see error with invalid email format", async ({ page }) => {
    await page.goto("/register");
    await page.locator('input[type="email"]').first().fill("notanemail");
    await page.locator('input[type="password"]').first().fill("ValidPass123!");
    await page.locator('input[type="password"]').nth(1).fill("ValidPass123!");

    await page.getByRole("button", { name: /ایجاد حساب|register/i }).click();

    await expect(
      page.locator("text=/فرمت ایمیل|email format|valid email/i"),
    ).toBeVisible();
  });

  test("user should see error when passwords do not match", async ({
    page,
  }) => {
    const timestamp = Date.now();

    await page.goto("/register");
    await page
      .locator('input[type="email"]')
      .first()
      .fill(`nomatch_${timestamp}@example.com`);
    await page.locator('input[type="password"]').first().fill("ValidPass123!");
    await page
      .locator('input[type="password"]')
      .nth(1)
      .fill("DifferentPass123!");

    await page.getByRole("button", { name: /ایجاد حساب|register/i }).click();

    await expect(
      page.locator("text=/رمزهای عبور|passwords do not|do not match/i"),
    ).toBeVisible();
  });
});
