import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function copyIfExists(
  root: string,
  sandbox: string,
  relativePath: string,
): void {
  const source =
    path.join(
      root,
      relativePath,
    );

  if (!fs.existsSync(source)) {
    return;
  }

  fs.cpSync(
    source,
    path.join(
      sandbox,
      relativePath,
    ),
    {
      recursive: true,
    },
  );
}

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

  /*
   * Copy only runtime automation artifacts.
   *
   * TestFlow's own unit/smoke tests are framework
   * validation and must not become part of the
   * generated application sandbox.
   */
  copyIfExists(
    root,
    sandbox,
    'src',
  );

  copyIfExists(
    root,
    sandbox,
    'tests/e2e',
  );

  copyIfExists(
    root,
    sandbox,
    'playwright.config.ts',
  );

  copyIfExists(
    root,
    sandbox,
    'tsconfig.json',
  );

  copyIfExists(
    root,
    sandbox,
    'package.json',
  );

  return sandbox;
}
