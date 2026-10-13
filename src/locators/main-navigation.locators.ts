import type { Page } from '@playwright/test';

export class MainNavigationLocators {
  constructor(private readonly page: Page) {}

  get pimLink() {
    return this.page.getByRole('link', { name: 'PIM' });
  }
}
