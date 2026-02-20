import { Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async fillEmail(email: string) {
    await this.page
      .locator('input[type="email"], input[type="text"]')
      .first()
      .fill(email);
  }

  async fillPassword(password: string) {
    await this.page.locator('input[type="password"]').first().fill(password);
  }

  async clickLogin() {
    await this.page.getByRole("button", { name: /ورود|login/i }).click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();

    await this.page.waitForURL(/\/(inbox|select-organization|onboarding)/);

    if (this.page.url().includes("/select-organization")) {
      const orgButtons = this.page.locator('button[type="button"]');
      const count = await orgButtons.count();
      if (count > 1) {
        await orgButtons.nth(1).click();
        await this.page.waitForURL(/\/inbox/);
      }
    }
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator("text=" + message)).toBeVisible();
  }

  async expectRedirectToDashboard() {
    await this.page.waitForURL(/\/(inbox|select-organization)/);
  }
}
