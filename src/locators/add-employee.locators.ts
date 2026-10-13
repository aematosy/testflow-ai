import type { Page } from '@playwright/test';

export class AddEmployeeLocators {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'Add Employee' });
  }

  get firstName() {
    return this.page.getByPlaceholder('First Name');
  }

  get lastName() {
    return this.page.getByPlaceholder('Last Name');
  }

  get employeeId() {
    return this.page.getByLabel('Employee Id');
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }
}
