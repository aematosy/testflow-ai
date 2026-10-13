import {
  expect,
  test,
} from '@playwright/test';

import {
  parseGenerationManifest,
} from '../../../../tools/testflow/generator/manifest/manifest-parser';

test(
  'parses valid generation manifest',
  () => {
    const result =
      parseGenerationManifest(
        JSON.stringify({
          version: '1.0',
          recordingId: 'TF-TEST',
          files: [
            {
              operation: 'CREATE',
              path:
                'src/pages/login.page.ts',
              content:
                'export class LoginPage {}',
            },
          ],
        }),
      );

    expect(
      result.files,
    ).toHaveLength(1);
  },
);

test(
  'rejects non JSON generator output',
  () => {
    expect(
      () =>
        parseGenerationManifest(
          'I created the files.',
        ),
    ).toThrow(
      'Generator output is not valid JSON.',
    );
  },
);
