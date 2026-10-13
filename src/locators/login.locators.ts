import type { Page } from '@playwright/test';

export class LoginLocators {
  constructor(private readonly page: Page) {}

  get username() {
    return this.page.getByPlaceholder('Username');
  }

  get password() {
    return this.page.getByPlaceholder('Password');
  }

  get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }
}
