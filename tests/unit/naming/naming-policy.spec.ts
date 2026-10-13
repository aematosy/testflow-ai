import {
  expect,
  test,
} from '@playwright/test';

import {
  canonicalArtifactName,
} from '../../../tools/testflow/naming/naming-policy';

test(
  'normalizes locator naming',
  () => {
    expect(
      canonicalArtifactName({
        change: 'CREATE',
        type: 'locator',
        name: 'LoginLocators',
        path: 'ignored',
        owns: [],
        reason: 'test',
        confidence: 1,
      }),
    ).toEqual({
      name: 'LoginLocators',
      path:
        'src/locators/login.locators.ts',
    });
  },
);

test(
  'normalizes page naming',
  () => {
    expect(
      canonicalArtifactName({
        change: 'CREATE',
        type: 'page',
        name: 'EmployeeListPage',
        path: 'ignored',
        owns: [],
        reason: 'test',
        confidence: 1,
      }),
    ).toEqual({
      name:
        'EmployeeListPage',
      path:
        'src/pages/employee-list.page.ts',
    });
  },
);

test(
  'normalizes test into e2e directory',
  () => {
    expect(
      canonicalArtifactName({
        change: 'CREATE',
        type: 'test',
        name: 'AddEmployee',
        path: 'ignored',
        owns: [],
        reason: 'test',
        confidence: 1,
      }),
    ).toEqual({
      name:
        'AddEmployeeTest',
      path:
        'tests/e2e/add-employee.spec.ts',
    });
  },
);
