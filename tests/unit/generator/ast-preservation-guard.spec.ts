import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  expect,
  test,
} from '@playwright/test';

import {
  validateAstPreservation,
} from '../../../tools/testflow/generator/ast-preservation-guard';

function temporaryFile(
  directory: string,
  name: string,
  content: string,
): string {
  const file =
    path.join(
      directory,
      name,
    );

  fs.writeFileSync(
    file,
    content,
    'utf-8',
  );

  return file;
}

test(
  'allows additive locator evolution',
  () => {
    const directory =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-ast-',
        ),
      );

    const before =
      temporaryFile(
        directory,
        'before.ts',
        `
export class HomeLocators {
  profile() {
    return 'profile';
  }

  settings() {
    return 'settings';
  }
}
`,
      );

    const after =
      temporaryFile(
        directory,
        'after.ts',
        `
export class HomeLocators {
  profile() {
    return 'profile';
  }

  settings() {
    return 'settings';
  }

  reports() {
    return 'reports';
  }
}
`,
      );

    const result =
      validateAstPreservation(
        before,
        after,
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
  'blocks deletion of existing locator methods',
  () => {
    const directory =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-ast-',
        ),
      );

    const before =
      temporaryFile(
        directory,
        'before.ts',
        `
export class HomeLocators {
  profile() {
    return 'profile';
  }

  settings() {
    return 'settings';
  }
}
`,
      );

    const after =
      temporaryFile(
        directory,
        'after.ts',
        `
export class HomeLocators {
  reports() {
    return 'reports';
  }
}
`,
      );

    const result =
      validateAstPreservation(
        before,
        after,
      );

    expect(
      result.valid,
    ).toBe(false);

    expect(
      result.errors,
    ).toContain(
      'Method removed from HomeLocators: profile',
    );

    expect(
      result.errors,
    ).toContain(
      'Method removed from HomeLocators: settings',
    );
  },
);

test(
  'blocks deletion of an existing class',
  () => {
    const directory =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'tf-ast-',
        ),
      );

    const before =
      temporaryFile(
        directory,
        'before.ts',
        `
export class HomeLocators {
  profile() {
    return 'profile';
  }
}
`,
      );

    const after =
      temporaryFile(
        directory,
        'after.ts',
        `
export class ReplacementLocators {
  reports() {
    return 'reports';
  }
}
`,
      );

    const result =
      validateAstPreservation(
        before,
        after,
      );

    expect(
      result.valid,
    ).toBe(false);

    expect(
      result.errors,
    ).toContain(
      'Existing class removed: HomeLocators',
    );
  },
);
