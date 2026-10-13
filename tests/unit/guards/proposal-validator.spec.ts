import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  expect,
  test,
} from '@playwright/test';

import type {
  ArchitectureProposal,
  ArchitectureProposalArtifact,
} from '../../../tools/testflow/agents/architecture-proposal';

import {
  validateArchitectureProposal,
} from '../../../tools/testflow/guards/proposal-validator';

import type {
  RepositoryKnowledgeModel,
} from '../../../tools/testflow/repository/repository-model';

const forbiddenOperations:
  ArchitectureProposal['forbiddenOperations'] = [
    'DELETE_EXISTING_FILE',
    'DELETE_EXISTING_METHOD',
    'DELETE_EXISTING_LOCATOR',
    'RENAME_EXISTING_API',
    'REPLACE_EXISTING_FILE',
  ];

function repository(
  files: RepositoryKnowledgeModel['files'] = [],
): RepositoryKnowledgeModel {
  const classes =
    files.flatMap(
      (file) => file.classes,
    );

  return {
    version: '1.0',
    generatedAt:
      '2026-01-01T00:00:00.000Z',
    repository: {
      root: '/test',
    },
    statistics: {
      files: files.length,
      classes: classes.length,
      methods:
        classes.flatMap(
          (artifact) =>
            artifact.methods,
        ).length,
      locators:
        files.filter(
          (file) =>
            file.type === 'locator',
        ).length,
      pages:
        files.filter(
          (file) =>
            file.type === 'page',
        ).length,
      components:
        files.filter(
          (file) =>
            file.type === 'component',
        ).length,
      flows:
        files.filter(
          (file) =>
            file.type === 'flow',
        ).length,
      tests:
        files.filter(
          (file) =>
            file.type === 'test',
        ).length,
    },
    files,
  };
}

function proposal(
  artifact: ArchitectureProposalArtifact,
): ArchitectureProposal {
  return {
    version: '1.0',
    recordingId: 'TF-TEST',
    repositoryIndexVersion: '1.0',
    generatedBy: 'manual',
    artifacts: [
      artifact,
    ],
    forbiddenOperations,
  };
}

function existingLocatorRepository():
  RepositoryKnowledgeModel {
  return repository([
    {
      path:
        'src/locators/home.locators.ts',
      type: 'locator',
      classes: [
        {
          name: 'HomeLocators',
          file:
            'src/locators/home.locators.ts',
          type: 'locator',
          methods: [
            {
              name: 'profile',
              visibility: 'public',
              isAsync: false,
              parameters: [],
            },
          ],
          imports: [],
        },
      ],
    },
  ]);
}

test.describe(
  'Architecture proposal guard',
  () => {
    let root: string;

    test.beforeEach(() => {
      root =
        fs.mkdtempSync(
          path.join(
            os.tmpdir(),
            'testflow-guard-',
          ),
        );
    });

    test.afterEach(() => {
      fs.rmSync(
        root,
        {
          recursive: true,
          force: true,
        },
      );
    });

    test(
      'allows legitimate CREATE',
      () => {
        const result =
          validateArchitectureProposal(
            proposal({
              change: 'CREATE',
              type: 'locator',
              name:
                'LoginLocators',
              path:
                'src/locators/login.locators.ts',
              owns: [
                'USERNAME',
                'PASSWORD',
              ],
              reason:
                'No existing owner.',
              confidence: 1,
            }),
            repository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(true);

        expect(
          result.errors,
        ).toHaveLength(0);
      },
    );

    test(
      'blocks CREATE over existing artifact',
      () => {
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
            'src/locators/home.locators.ts',
          ),
          '',
        );

        const result =
          validateArchitectureProposal(
            proposal({
              change: 'CREATE',
              type: 'locator',
              name:
                'HomeLocators',
              path:
                'src/locators/home.locators.ts',
              owns: [
                'REPORTS',
              ],
              reason:
                'Unsafe duplicate.',
              confidence: 1,
            }),
            existingLocatorRepository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(false);

        expect(
          result.errors.some(
            (issue) =>
              issue.message.includes(
                'CREATE collides',
              ),
          ),
        ).toBe(true);
      },
    );

    test(
      'allows additive MODIFY of existing artifact',
      () => {
        const result =
          validateArchitectureProposal(
            proposal({
              change: 'MODIFY',
              type: 'locator',
              name:
                'HomeLocators',
              path:
                'src/locators/home.locators.ts',
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
                'Existing locator owner.',
              confidence: 0.95,
            }),
            existingLocatorRepository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(true);
      },
    );

    test(
      'blocks MODIFY when target file does not exist',
      () => {
        const result =
          validateArchitectureProposal(
            proposal({
              change: 'MODIFY',
              type: 'page',
              name:
                'MissingPage',
              path:
                'src/pages/missing.page.ts',
              owns: [
                'MISSING',
              ],
              additions: {
                methods: [
                  'open',
                ],
              },
              reason:
                'Invalid modify.',
              confidence: 1,
            }),
            repository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(false);
      },
    );

    test(
      'blocks MODIFY without explicit additions',
      () => {
        const result =
          validateArchitectureProposal(
            proposal({
              change: 'MODIFY',
              type: 'locator',
              name:
                'HomeLocators',
              path:
                'src/locators/home.locators.ts',
              owns: [
                'REPORTS',
              ],
              reason:
                'Missing additive contract.',
              confidence: 1,
            }),
            existingLocatorRepository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(false);

        expect(
          result.errors.some(
            (issue) =>
              issue.message.includes(
                'explicitly declare additive changes',
              ),
          ),
        ).toBe(true);
      },
    );

    test(
      'allows legitimate REUSE',
      () => {
        const result =
          validateArchitectureProposal(
            proposal({
              change: 'REUSE',
              type: 'locator',
              name:
                'HomeLocators',
              path:
                'src/locators/home.locators.ts',
              owns: [
                'PROFILE',
              ],
              reason:
                'Existing capability.',
              confidence: 1,
            }),
            existingLocatorRepository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(true);
      },
    );

    test(
      'blocks REUSE of missing artifact',
      () => {
        const result =
          validateArchitectureProposal(
            proposal({
              change: 'REUSE',
              type: 'flow',
              name:
                'MissingFlow',
              path:
                'src/flows/missing.flow.ts',
              owns: [
                'missing',
              ],
              reason:
                'Invalid reuse.',
              confidence: 1,
            }),
            repository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(false);
      },
    );

    test(
      'blocks paths escaping repository',
      () => {
        const result =
          validateArchitectureProposal(
            proposal({
              change: 'CREATE',
              type: 'locator',
              name:
                'DangerousLocators',
              path:
                '../dangerous.locators.ts',
              owns: [
                'DANGER',
              ],
              reason:
                'Unsafe path.',
              confidence: 1,
            }),
            repository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(false);

        expect(
          result.errors.some(
            (issue) =>
              issue.message.includes(
                'escapes',
              ),
          ),
        ).toBe(true);
      },
    );

    test(
      'blocks locator outside locator directory',
      () => {
        const result =
          validateArchitectureProposal(
            proposal({
              change: 'CREATE',
              type: 'locator',
              name:
                'HomeLocators',
              path:
                'src/pages/home.locators.ts',
              owns: [
                'HOME',
              ],
              reason:
                'Wrong ownership directory.',
              confidence: 1,
            }),
            repository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(false);

        expect(
          result.errors.some(
            (issue) =>
              issue.message.includes(
                'src/locators/',
              ),
          ),
        ).toBe(true);
      },
    );

    test(
      'warns on low confidence',
      () => {
        const result =
          validateArchitectureProposal(
            proposal({
              change: 'CREATE',
              type: 'page',
              name:
                'UncertainPage',
              path:
                'src/pages/uncertain.page.ts',
              owns: [
                'UNCERTAIN',
              ],
              reason:
                'Weak ownership evidence.',
              confidence: 0.5,
            }),
            repository(),
            root,
          );

        expect(
          result.valid,
        ).toBe(true);

        expect(
          result.warnings,
        ).toHaveLength(1);
      },
    );
  },
);
