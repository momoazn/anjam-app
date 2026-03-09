/* eslint-disable react-hooks/rules-of-hooks */
import { Page, test as base, expect } from "@playwright/test";

import { loginAs } from "../utils/auth";
import { TEST_USERS } from "./test-data";

type AuthFixtures = {
  adminPage: Page;
  managerPage: Page;
  employeePage: Page;
  authenticatedPage: Page;
};

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
