import {
  test,
} from '@playwright/test';

import {
  AddEmployeeFlow,
  type AddEmployeeFlowData,
} from '../../src/flows/add-employee.flow';

import {
  requiredEnvironmentValue,
} from '../../tools/testflow/config/environment';

import {
  addEmployeeCases,
} from '../../test-data/add-employee.data';

const credentials = {
  username:
    requiredEnvironmentValue(
      'TEST_USERNAME',
    ),

  password:
    requiredEnvironmentValue(
      'TEST_PASSWORD',
    ),
};

for (
  const scenario of
  addEmployeeCases
) {
  test(
    `Add employee | ${scenario.name}`,
    async ({ page }) => {
      const flow =
        new AddEmployeeFlow(
          page,
        );

      const data:
        AddEmployeeFlowData = {
          credentials,
          employee:
            scenario.employee,
        };

      await flow.addEmployee(
        data,
      );
    },
  );
}
