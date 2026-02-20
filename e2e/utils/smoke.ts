import { Page, expect } from "@playwright/test";

export async function expectPageReady(
  page: Page,
  urlPattern: RegExp,
  stableLocator: string,
) {
  await expect(page).toHaveURL(urlPattern);
  await expect(page.getByText("Not Found")).toHaveCount(0);
  await expect(page.locator(stableLocator)).toBeVisible({ timeout: 15000 });
}
