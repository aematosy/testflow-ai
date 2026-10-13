import fs from 'node:fs';
import path from 'node:path';

import {
  resolveProjectPaths,
} from '../core/project-paths';

import type {
  RepositoryKnowledgeModel,
} from '../repository/repository-model';

export function storeRepositoryIndex(
  model: RepositoryKnowledgeModel,
): string {
  const paths =
    resolveProjectPaths();

  fs.mkdirSync(
    paths.index,
    {
      recursive: true,
    },
  );

  const destination =
    path.join(
      paths.index,
      'repository.index.json',
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
