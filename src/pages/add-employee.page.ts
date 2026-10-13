import { expect, type Page } from '@playwright/test';
import { AddEmployeeLocators } from '../locators/add-employee.locators';

export interface EmployeeDetails {
  firstName: string;
  lastName: string;
  employeeId: string;
}

export class AddEmployeePage {
  private readonly locators: AddEmployeeLocators;

  constructor(page: Page) {
    this.locators = new AddEmployeeLocators(page);
  }

  async expectFormReady(): Promise<void> {
    await expect(this.locators.heading).toHaveText('Add Employee');
  }

  async fillEmployeeDetails(employee: EmployeeDetails): Promise<void> {
    await this.locators.firstName.fill(employee.firstName);
    await this.locators.lastName.fill(employee.lastName);
    await this.locators.employeeId.fill(employee.employeeId);
  }

  async saveEmployee(): Promise<void> {
    await this.locators.saveButton.click();
  }
}
