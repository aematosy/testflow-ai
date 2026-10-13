import {
  expect,
  test,
} from '@playwright/test';

import {
  validateGenerationPolicy,
} from '../../../tools/testflow/generator/generation-policy-validator';

import type {
  CanonicalTestFlow,
} from '../../../tools/testflow/model/canonical-model';

const model =
  {
    modelVersion: '1.0',

    recording: {
      schemaVersion: '2.1',
      sessionId: 'TEST',
      sessionName: 'Test',
      generatedAt:
        '2026-01-01T00:00:00.000Z',
    },

    application: {
      origin:
        'https://example.test',
    },

    steps: [
      {
        id: 'step-1',
        name: 'Form',
        page:
          'https://example.test/form',
        actions: [
          {
            sequence: 1,
            type: 'type',
            name: 'First Name',
            targetKey:
              'FIRST_NAME',
            sensitive: false,
            skipped: false,
            value: 'adrian',
          },
        ],
      },
    ],

    targets: [],

    statistics: {
      steps: 1,
      actions: 1,
      assertions: 0,
      sensitiveActions: 0,
      skippedActions: 0,
      uniqueTargets: 0,
    },
  } satisfies CanonicalTestFlow;

test(
  'blocks absolute application URLs',
  () => {
    const result =
      validateGenerationPolicy(
        {
          version: '1.0',
          recordingId: 'TF-TEST',
          files: [
            {
              operation: 'CREATE',
              path:
                'src/pages/login.page.ts',
              content:
                "await page.goto('https://example.test/login');",
            },
          ],
        },
        model,
      );

    expect(
      result.valid,
    ).toBe(false);
  },
);

test(
  'blocks recorded values embedded in e2e spec',
  () => {
    const result =
      validateGenerationPolicy(
        {
          version: '1.0',
          recordingId: 'TF-TEST',
          files: [
            {
              operation: 'CREATE',
              path:
                'tests/e2e/add-employee.spec.ts',
              content:
                "const firstName = 'adrian';",
            },
          ],
        },
        model,
      );

    expect(
      result.valid,
    ).toBe(false);
  },
);

test(
  'blocks hard waits',
  () => {
    const result =
      validateGenerationPolicy(
        {
          version: '1.0',
          recordingId: 'TF-TEST',
          files: [
            {
              operation: 'CREATE',
              path:
                'src/pages/home.page.ts',
              content:
                'await page.waitForTimeout(5000);',
            },
          ],
        },
        model,
      );

    expect(
      result.valid,
    ).toBe(false);
  },
);

test(
  'allows relative navigation and runtime data',
  () => {
    const result =
      validateGenerationPolicy(
        {
          version: '1.0',
          recordingId: 'TF-TEST',
          files: [
            {
              operation: 'CREATE',
              path:
                'src/pages/login.page.ts',
              content:
                "await page.goto('/web/index.php/auth/login');",
            },
            {
              operation: 'CREATE',
              path:
                'tests/e2e/add-employee.spec.ts',
              content:
                'await flow.createEmployee(testData.employee);',
            },
          ],
        },
        model,
      );

    expect(
      result.valid,
    ).toBe(true);
  },
);
