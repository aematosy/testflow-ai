import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const COPY_ENTRIES = [
  'src',
  'tests',
  'playwright.config.ts',
  'tsconfig.json',
  'package.json',
];

export function createGeneratorSandbox(
  root: string = process.cwd(),
): string {
  const sandbox =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'testflow-generator-',
      ),
    );

  for (
    const entry of COPY_ENTRIES
  ) {
    const source =
      path.join(
        root,
        entry,
      );

    if (
      !fs.existsSync(source)
    ) {
      continue;
    }

    fs.cpSync(
      source,
      path.join(
        sandbox,
        entry,
      ),
      {
        recursive: true,
      },
    );
  }

  return sandbox;
}
