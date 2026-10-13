import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  expect,
  test,
} from '@playwright/test';

import type {
  ApprovedPlan,
} from '../../../tools/testflow/approval/approved-plan';

import {
  validateGeneratedPatch,
} from '../../../tools/testflow/generator/patch-guard';

function plan(
  artifacts:
    ApprovedPlan['proposal']['artifacts'],
): ApprovedPlan {
  return {
    version: '1.0',

    proposal: {
      version: '1.0',
      recordingId:
        'TF-TEST',
      repositoryIndexVersion:
        '1.0',
      generatedBy:
        'planner-agent',
      artifacts,
      forbiddenOperations: [
        'DELETE_EXISTING_FILE',
        'DELETE_EXISTING_METHOD',
        'DELETE_EXISTING_LOCATOR',
        'RENAME_EXISTING_API',
        'REPLACE_EXISTING_FILE',
      ],
    },

    approval: {
      approved: true,
      approvedAt:
        '2026-01-01T00:00:00.000Z',
      approvedBy:
        'test',
    },

    repositoryBaseline: {
      gitCommit:
        'test',
      gitTree:
        'test',
      clean:
        true,
    },
  };
}

test(
  'allows approved CREATE',
  () => {
    const repo =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-repo-',
        ),
      );

    const sandbox =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-sandbox-',
        ),
      );

    fs.mkdirSync(
      path.join(
        sandbox,
        'src/locators',
      ),
      {
        recursive: true,
      },
    );

    fs.writeFileSync(
      path.join(
        sandbox,
        'src/locators/login.locators.ts',
      ),
      'export class LoginLocators {}',
    );

    const result =
      validateGeneratedPatch(
        plan([
          {
            change:
              'CREATE',
            type:
              'locator',
            name:
              'LoginLocators',
            path:
              'src/locators/login.locators.ts',
            owns: [
              'LOGIN',
            ],
            reason:
              'test',
            confidence:
              1,
          },
        ]),
        repo,
        sandbox,
      );

    expect(
      result.valid,
    ).toBe(true);

    expect(
      result.changes,
    ).toEqual([
      {
        path:
          'src/locators/login.locators.ts',
        operation:
          'CREATE',
      },
    ]);
  },
);

test(
  'blocks unauthorized file',
  () => {
    const repo =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-repo-',
        ),
      );

    const sandbox =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-sandbox-',
        ),
      );

    fs.writeFileSync(
      path.join(
        sandbox,
        'evil.ts',
      ),
      'bad',
    );

    const result =
      validateGeneratedPatch(
        plan([]),
        repo,
        sandbox,
      );

    expect(
      result.valid,
    ).toBe(false);

    expect(
      result.errors,
    ).toContain(
      'Unauthorized created file: evil.ts',
    );
  },
);

test(
  'blocks modification of REUSE artifact',
  () => {
    const repo =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-repo-',
        ),
      );

    const sandbox =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-sandbox-',
        ),
      );

    const relative =
      'src/locators/home.locators.ts';

    for (
      const root of [
        repo,
        sandbox,
      ]
    ) {
      fs.mkdirSync(
        path.join(
          root,
          'src/locators',
        ),
        {
          recursive: true,
        },
      );
    }

    fs.writeFileSync(
      path.join(
        repo,
        relative,
      ),
      'original',
    );

    fs.writeFileSync(
      path.join(
        sandbox,
        relative,
      ),
      'changed',
    );

    const result =
      validateGeneratedPatch(
        plan([
          {
            change:
              'REUSE',
            type:
              'locator',
            name:
              'HomeLocators',
            path:
              relative,
            owns: [
              'HOME',
            ],
            reason:
              'reuse',
            confidence:
              1,
          },
        ]),
        repo,
        sandbox,
      );

    expect(
      result.valid,
    ).toBe(false);

    expect(
      result.errors.some(
        (error) =>
          error.includes(
            'REUSE artifact was modified',
          ),
      ),
    ).toBe(true);
  },
);

test(
  'blocks when approved CREATE was not generated',
  () => {
    const repo =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-repo-',
        ),
      );

    const sandbox =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-sandbox-',
        ),
      );

    const result =
      validateGeneratedPatch(
        plan([
          {
            change:
              'CREATE',
            type:
              'locator',
            name:
              'LoginLocators',
            path:
              'src/locators/login.locators.ts',
            owns: [
              'LOGIN',
            ],
            reason:
              'Required creation.',
            confidence:
              1,
          },
        ]),
        repo,
        sandbox,
      );

    expect(
      result.valid,
    ).toBe(false);

    expect(
      result.errors,
    ).toContain(
      'Approved CREATE was not generated: src/locators/login.locators.ts',
    );
  },
);

test(
  'blocks when approved MODIFY was not implemented',
  () => {
    const repo =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-repo-',
        ),
      );

    const sandbox =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-sandbox-',
        ),
      );

    const relative =
      'src/locators/home.locators.ts';

    for (
      const root of [
        repo,
        sandbox,
      ]
    ) {
      fs.mkdirSync(
        path.join(
          root,
          'src/locators',
        ),
        {
          recursive: true,
        },
      );

      fs.writeFileSync(
        path.join(
          root,
          relative,
        ),
        `
export class HomeLocators {
  profile() {}
}
`,
      );
    }

    const result =
      validateGeneratedPatch(
        plan([
          {
            change:
              'MODIFY',
            type:
              'locator',
            name:
              'HomeLocators',
            path:
              relative,
            owns: [
              'REPORTS',
            ],
            additions: {
              targets: [
                'REPORTS',
              ],
              methods: [
                'reports',
              ],
            },
            reason:
              'Extend existing owner.',
            confidence:
              1,
          },
        ]),
        repo,
        sandbox,
      );

    expect(
      result.valid,
    ).toBe(false);

    expect(
      result.errors,
    ).toContain(
      'Approved MODIFY was not implemented: src/locators/home.locators.ts',
    );
  },
);
