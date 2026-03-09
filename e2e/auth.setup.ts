import fs from "fs";
import path from "path";

import { test as setup } from "@playwright/test";

import { TEST_USERS } from "./fixtures/test-data";
import { loginAs } from "./utils/auth";

const authDir = "playwright/.auth";
const authFileUser = `${authDir}/user.json`;

setup("authenticate as manager (org1)", async ({ page }) => {
  const authDirPath = path.dirname(authFileUser);
  if (!fs.existsSync(authDirPath)) {
    fs.mkdirSync(authDirPath, { recursive: true });
  }

  await loginAs(page, TEST_USERS.manager, { organizationPattern: /^org1$/ });
  await page.context().storageState({ path: authFileUser });
  console.log("✅ Authentication setup complete (org1)");
});

setup("authenticate as supervisor (org2)", async ({ page }) => {
  const authDirPath = path.dirname(authFileUser);
  if (!fs.existsSync(authDirPath)) {
    fs.mkdirSync(authDirPath, { recursive: true });
  }

  await loginAs(page, TEST_USERS.supervisor, { organizationPattern: /^org2$/ });
  await page.context().storageState({ path: authFileUser });
  console.log("✅ Authentication setup complete (org2)");
});
