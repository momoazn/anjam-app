import { Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async fillEmail(email: string) {
    await this.page.getByPlaceholder(/ایمیل|email/i).fill(email);
  }

  async fillPassword(password: string) {
    await this.page.getByPlaceholder(/رمز عبور|password/i).fill(password);
  }

  async clickLogin() {
    await this.page.getByRole("button", { name: /ورود|login/i }).click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator("text=" + message)).toBeVisible();
  }

  async expectRedirectToDashboard() {
    await this.page.waitForURL(/\/(dashboard|select-organization)/);
  }
}
