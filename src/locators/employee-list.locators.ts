import type { Page } from '@playwright/test';

export class EmployeeListLocators {
  constructor(private readonly page: Page) {}

  get addButton() {
    return this.page.locator("xpath=//button[normalize-space(.)='Add']");
  }
}
