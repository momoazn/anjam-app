import fs from "fs";
import path from "path";

import { type Page, test as setup } from "@playwright/test";

import { TEST_USERS } from "./fixtures/test-data";

const authDir = "playwright/.auth";
const authFileUser = `${authDir}/user.json`;
const authFileProductMode = `${authDir}/user-product-mode.json`;

async function authenticateAndSelectOrg(
  page: Page,
  email: string,
  password: string,
  orgSlugPattern: RegExp,
) {
  const authDirPath = path.dirname(authFileUser);
  if (!fs.existsSync(authDirPath)) {
    fs.mkdirSync(authDirPath, { recursive: true });
  }

  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  const textboxes = page.getByRole("textbox");
  await textboxes.first().fill(email);
  await textboxes.nth(1).fill(password);

  await page.getByRole("button", { name: /ورود|login/i }).click();

  await page.waitForURL(/\/(dashboard|select-organization|onboarding)/);
  await page.waitForLoadState("networkidle");

  const orgSelector = page
    .locator('[role="button"]')
    .filter({ has: page.locator(`text=/${orgSlugPattern.source}/`) });
  const orgCount = await orgSelector.count();

  if (orgCount > 0) {
    await orgSelector.first().click();
    await page.waitForURL(/\/dashboard/);
    await page.waitForLoadState("networkidle");
  }
}

setup("authenticate as manager (operations mode org1)", async ({ page }) => {
  await authenticateAndSelectOrg(
    page,
    TEST_USERS.manager.email,
    TEST_USERS.manager.password,
    /^org1$/,
  );
  await page.context().storageState({ path: authFileUser });
  console.log("✅ Authentication setup complete (org1 - operations mode)");
});

setup("authenticate as supervisor (product mode org2)", async ({ page }) => {
  const authDirPath = path.dirname(authFileProductMode);
  if (!fs.existsSync(authDirPath)) {
    fs.mkdirSync(authDirPath, { recursive: true });
  }

  await authenticateAndSelectOrg(
    page,
    TEST_USERS.supervisor.email,
    TEST_USERS.supervisor.password,
    /^org2$/,
  );
  await page.context().storageState({ path: authFileProductMode });
  console.log("✅ Authentication setup complete (org2 - product mode)");
});
