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

test(
  'splits acronym followed by PascalCase word',
  () => {
    expect(
      canonicalArtifactName({
        change: 'CREATE',
        type: 'locator',
        name:
          'PIMEmployeeListLocators',
        path: 'ignored',
        owns: [],
        reason: 'test',
        confidence: 1,
      }),
    ).toEqual({
      name:
        'PimEmployeeListLocators',

      path:
        'src/locators/pim-employee-list.locators.ts',
    });
  },
);

test(
  'normalizes acronym page naming',
  () => {
    expect(
      canonicalArtifactName({
        change: 'CREATE',
        type: 'page',
        name:
          'PIMEmployeeListPage',
        path: 'ignored',
        owns: [],
        reason: 'test',
        confidence: 1,
      }),
    ).toEqual({
      name:
        'PimEmployeeListPage',

      path:
        'src/pages/pim-employee-list.page.ts',
    });
  },
);
