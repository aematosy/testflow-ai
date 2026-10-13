import type { Page } from '@playwright/test';

export class AddEmployeeLocators {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.locator("xpath=//h6[normalize-space(.)='Add Employee']");
  }

  get firstName() {
    return this.page.locator("input[name=\"firstName\"]");
  }

  get lastName() {
    return this.page.locator("input[name=\"lastName\"]");
  }

  get employeeId() {
    return this.page.locator("xpath=//label[normalize-space(.)='Employee Id']/parent::*/following-sibling::*//input");
  }

  get saveButton() {
    return this.page.locator("xpath=//button[normalize-space(.)='Save']");
  }
}
