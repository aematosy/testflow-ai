import { test } from '@playwright/test';
import { AddEmployeeFlow, type AddEmployeeFlowData } from '../../src/flows/add-employee.flow';

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const scenario: AddEmployeeFlowData = {
  credentials: {
    username: requiredEnvironmentValue('ORANGEHRM_USERNAME'),
    password: requiredEnvironmentValue('ORANGEHRM_PASSWORD'),
  },
  employee: {
    firstName: requiredEnvironmentValue('EMPLOYEE_FIRST_NAME'),
    lastName: requiredEnvironmentValue('EMPLOYEE_LAST_NAME'),
    employeeId: requiredEnvironmentValue('EMPLOYEE_ID'),
  },
};

test('adds an employee', async ({ page }) => {
  const addEmployeeFlow = new AddEmployeeFlow(page);
  await addEmployeeFlow.addEmployee(scenario);
});
