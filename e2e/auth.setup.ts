import { test as setup } from "@playwright/test";
import { TEST_USERS } from "./fixtures/test-data";
import fs from "fs";
import path from "path";

const authFile = "playwright/.auth/user.json";

setup("authenticate as manager", async ({ page }) => {
  // Create auth directory if it doesn't exist
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Login
  await page.goto("/login");

  // Wait for page to load
  await page.waitForLoadState("networkidle");

  // Fill credentials using role-based queries (Playwright best practice)
  const textboxes = page.getByRole("textbox");
  await textboxes.first().fill(TEST_USERS.manager.email);
  await textboxes.nth(1).fill(TEST_USERS.manager.password);

  // Click login
  await page.getByRole("button", { name: /ورود|login/i }).click();

  // Wait for navigation and dashboard to load
  await page.waitForURL(/\/(dashboard|select-organization|onboarding)/);
  await page.waitForLoadState("networkidle");

  // If on select-organization, select the first available organization
  const orgSelector = page
    .locator('[role="button"]')
    .filter({ has: page.locator("text=/[A-Z]{3}/") });
  const orgCount = await orgSelector.count();

  if (orgCount > 0) {
    await orgSelector.first().click();
    await page.waitForURL(/\/dashboard/);
    await page.waitForLoadState("networkidle");
  }

  // Save storage state
  await page.context().storageState({ path: authFile });

  console.log("✅ Authentication setup complete");
});
