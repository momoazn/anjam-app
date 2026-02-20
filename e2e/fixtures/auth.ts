/* eslint-disable react-hooks/rules-of-hooks */
import { Page, test as base, expect } from "@playwright/test";

import { TEST_USERS } from "./test-data";

type AuthFixtures = {
  adminPage: Page;
  managerPage: Page;
  employeePage: Page;
  authenticatedPage: Page;
};

/**
 * Login helper function
 */
async function loginAs(
  page: Page,
  credentials: (typeof TEST_USERS)[keyof typeof TEST_USERS],
) {
  await page.goto("/login");
  await page
    .locator('input[type="email"], input[type="text"]')
    .first()
    .fill(credentials.email);
  await page
    .locator('input[type="password"]')
    .first()
    .fill(credentials.password);

  // Click login button
  const loginButton = page.getByRole("button", { name: /ورود|login/i });
  await loginButton.click();

  // Wait for navigation (inbox or org/onboarding screens)
  await page.waitForURL(/\/(inbox|select-organization|onboarding)/);

  // If on select-organization, select the first organization card (skip create card).
  if (page.url().includes("/select-organization")) {
    const orgButtons = page.locator('button[type="button"]');
    const count = await orgButtons.count();
    if (count > 1) {
      await orgButtons.nth(1).click();
      await page.waitForURL(/\/inbox/);
    }
  }
}

/**
 * Auth fixtures for different user roles
 */
export const test = base.extend<AuthFixtures>({
  page: async ({ page }, use) => {
    await loginAs(page, TEST_USERS.manager);
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    await loginAs(page, TEST_USERS.admin);
    await use(page);
  },

  managerPage: async ({ page }, use) => {
    await loginAs(page, TEST_USERS.manager);
    await use(page);
  },

  employeePage: async ({ page }, use) => {
    await loginAs(page, TEST_USERS.employee1);
    await use(page);
  },

  authenticatedPage: async ({ page }, use) => {
    await loginAs(page, TEST_USERS.manager);
    await use(page);
  },
});

export { expect };
