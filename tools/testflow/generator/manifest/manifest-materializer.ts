import fs from 'node:fs';
import path from 'node:path';

import type {
  GenerationManifest,
} from './generation-manifest';

export function materializeManifest(
  manifest: GenerationManifest,
  sandboxRoot: string,
): void {
  for (const file of manifest.files) {
    const destination =
      path.resolve(
        sandboxRoot,
        file.path,
      );

    const relative =
      path.relative(
        sandboxRoot,
        destination,
      );

    if (
      relative.startsWith('..') ||
      path.isAbsolute(relative)
    ) {
      throw new Error(
        `Generated path escapes sandbox: ${file.path}`,
      );
    }

    fs.mkdirSync(
      path.dirname(destination),
      {
        recursive: true,
      },
    );

    fs.writeFileSync(
      destination,
      file.content,
      'utf-8',
    );
  }
}
