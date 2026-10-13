import type { Page } from '@playwright/test';
import { EmployeeListLocators } from '../locators/employee-list.locators';

export class EmployeeListPage {
  private readonly locators: EmployeeListLocators;

  constructor(page: Page) {
    this.locators = new EmployeeListLocators(page);
  }

  async openAddEmployeeForm(): Promise<void> {
    await this.locators.addButton.click();
  }
}
