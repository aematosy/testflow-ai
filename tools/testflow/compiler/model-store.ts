import fs from 'node:fs';
import path from 'node:path';

import {
  resolveProjectPaths,
} from '../core/project-paths';

import type {
  CanonicalTestFlow,
} from '../model/canonical-model';

export function storeCanonicalModel(
  id: string,
  model: CanonicalTestFlow,
): string {
  const paths = resolveProjectPaths();

  fs.mkdirSync(
    paths.models,
    {
      recursive: true,
    },
  );

  const destination = path.join(
    paths.models,
    `${id}.model.json`,
  );

  fs.writeFileSync(
    destination,
    JSON.stringify(
      model,
      null,
      2,
    ) + '\n',
    'utf-8',
  );

  return destination;
}
