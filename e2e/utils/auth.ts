import { type Page, expect } from "@playwright/test";

type Credentials = {
  email: string;
  password: string;
};

type LoginOptions = {
  organizationPattern?: RegExp;
  fallbackOrgIndex?: number;
};

export async function loginAs(
  page: Page,
  credentials: Credentials,
  options: LoginOptions = {},
) {
  const { organizationPattern, fallbackOrgIndex = 1 } = options;

  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  const textboxes = page.getByRole("textbox");
  await textboxes.first().fill(credentials.email);
  await textboxes.nth(1).fill(credentials.password);

  await page.getByRole("button", { name: /ورود|login/i }).click();
  await page.waitForURL(/\/(inbox|select-organization|onboarding)/);
  await page.waitForLoadState("networkidle");

  if (!page.url().includes("/select-organization")) {
    return;
  }

  if (organizationPattern) {
    const orgSelector = page
      .locator('[role="button"]')
      .filter({ hasText: organizationPattern });
    const orgCount = await orgSelector.count();
    if (orgCount > 0) {
      await orgSelector.first().click();
      await page.waitForURL(/\/inbox/);
      await page.waitForLoadState("networkidle");
      return;
    }
  }

  const orgButtons = page.locator('button[type="button"]');
  const count = await orgButtons.count();
  expect(
    count,
    "Expected at least one organization option in selector",
  ).toBeGreaterThan(fallbackOrgIndex);

  await orgButtons.nth(fallbackOrgIndex).click();
  await page.waitForURL(/\/inbox/);
  await page.waitForLoadState("networkidle");
}
