import fs from 'node:fs';
import path from 'node:path';

import {
  resolveProjectPaths,
} from '../core/project-paths';

import type {
  ImplementationPlan,
} from './implementation-plan';

export function storeImplementationPlan(
  plan: ImplementationPlan,
): string {
  const paths =
    resolveProjectPaths();

  fs.mkdirSync(
    paths.plans,
    {
      recursive: true,
    },
  );

  const destination =
    path.join(
      paths.plans,
      `${plan.recordingId}.plan.json`,
    );

  fs.writeFileSync(
    destination,
    JSON.stringify(
      plan,
      null,
      2,
    ) + '\n',
    'utf-8',
  );

  return destination;
}
