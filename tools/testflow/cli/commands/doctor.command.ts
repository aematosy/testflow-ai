import fs from 'node:fs';
import path from 'node:path';

import {
  resolveProjectPaths,
} from '../../core/project-paths';

interface Check {
  name: string;
  passed: boolean;
  detail: string;
}

function exists(target: string): boolean {
  return fs.existsSync(target);
}

export function runDoctor(): number {
  const paths = resolveProjectPaths();

  const checks: Check[] = [
    {
      name: 'package.json',
      passed: exists(path.join(paths.root, 'package.json')),
      detail: 'Node project',
    },
    {
      name: 'playwright.config.ts',
      passed: exists(
        path.join(paths.root, 'playwright.config.ts'),
      ),
      detail: 'Playwright configuration',
    },
    {
      name: 'tsconfig.json',
      passed: exists(path.join(paths.root, 'tsconfig.json')),
      detail: 'TypeScript configuration',
    },
    {
      name: 'src',
      passed: exists(paths.source),
      detail: 'Automation source',
    },
    {
      name: 'tests',
      passed: exists(paths.tests),
      detail: 'Playwright tests',
    },
    {
      name: '.testflow/recordings',
      passed: exists(paths.recordings),
      detail: 'Recorder input',
    },
  ];

  console.log('\nTestFlow Doctor');
  console.log('════════════════════════════════════════');

  for (const check of checks) {
    const status = check.passed ? 'PASS' : 'FAIL';

    console.log(
      `${status.padEnd(6)} ${check.name.padEnd(24)} ${check.detail}`,
    );
  }

  console.log('════════════════════════════════════════');

  const failed = checks.filter(
    (check) => !check.passed,
  );

  if (failed.length > 0) {
    console.log(
      `\nProject is not ready: ${failed.length} check(s) failed.\n`,
    );

    return 1;
  }

  console.log('\nProject is ready for TestFlow.\n');

  return 0;
}
