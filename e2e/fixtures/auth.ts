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
  await page.getByPlaceholder(/ایمیل|email/i).fill(credentials.email);
  await page.getByPlaceholder(/رمز عبور|password/i).fill(credentials.password);

  // Click login button
  const loginButton = page.getByRole("button", { name: /ورود|login/i });
  await loginButton.click();

  // Wait for navigation (dashboard or select organization)
  await page.waitForURL(/\/(dashboard|select-organization|onboarding)/);

  // If on select-organization, select first org
  const orgCards = page
    .locator('[role="button"]')
    .filter({ has: page.locator("text=/[A-Z]{3}/") });
  const count = await orgCards.count();
  if (count > 0) {
    await orgCards.first().click();
    await page.waitForURL(/\/dashboard/);
  }
}

/**
 * Auth fixtures for different user roles
 */
export const test = base.extend<AuthFixtures>({
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
