import type { Page } from '@playwright/test';
import { LoginLocators } from '../locators/login.locators';

export class LoginPage {
  private readonly locators: LoginLocators;

  constructor(private readonly page: Page) {
    this.locators = new LoginLocators(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  async logIn(username: string, password: string): Promise<void> {
    await this.locators.username.fill(username);
    await this.locators.password.fill(password);
    await this.locators.loginButton.click();
  }
}
