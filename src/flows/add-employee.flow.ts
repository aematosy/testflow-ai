import type { Page } from '@playwright/test';
import { MainNavigationComponent } from '../components/main-navigation.component';
import { AddEmployeePage, type EmployeeDetails } from '../pages/add-employee.page';
import { EmployeeListPage } from '../pages/employee-list.page';
import { LoginPage } from '../pages/login.page';

export interface AddEmployeeFlowData {
  credentials: {
    username: string;
    password: string;
  };
  employee: EmployeeDetails;
}

export class AddEmployeeFlow {
  private readonly loginPage: LoginPage;
  private readonly mainNavigation: MainNavigationComponent;
  private readonly employeeListPage: EmployeeListPage;
  private readonly addEmployeePage: AddEmployeePage;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
    this.mainNavigation = new MainNavigationComponent(page);
    this.employeeListPage = new EmployeeListPage(page);
    this.addEmployeePage = new AddEmployeePage(page);
  }

  async addEmployee(data: AddEmployeeFlowData): Promise<void> {
    await this.loginPage.open();
    await this.loginPage.logIn(data.credentials.username, data.credentials.password);
    await this.mainNavigation.navigateToPim();
    await this.employeeListPage.openAddEmployeeForm();
    await this.addEmployeePage.expectFormReady();
    await this.addEmployeePage.fillEmployeeDetails(data.employee);
    await this.addEmployeePage.saveEmployee();
  }
}
