import type { Page } from '@playwright/test';
import { MainNavigationLocators } from '../locators/main-navigation.locators';

export class MainNavigationComponent {
  private readonly locators: MainNavigationLocators;

  constructor(page: Page) {
    this.locators = new MainNavigationLocators(page);
  }

  async navigateToPim(): Promise<void> {
    await this.locators.pimLink.click();
  }
}
