import fs from 'node:fs';
import path from 'node:path';

import type {
  ArchitectureProposal,
} from '../../agents/architecture-proposal';

import type {
  CanonicalTestFlow,
} from '../../model/canonical-model';

import {
  compileLocatorExpression,
} from './locator-compiler';

function getterName(
  targetKey: string,
): string {
  const parts =
    targetKey
      .toLowerCase()
      .split('_')
      .filter(Boolean);

  return parts
    .map(
      (part, index) =>
        index === 0
          ? part
          : part.charAt(0).toUpperCase() +
            part.slice(1),
    )
    .join('');
}

export function materializeLocatorArtifacts(
  proposal: ArchitectureProposal,
  model: CanonicalTestFlow,
  sandboxRoot: string,
): void {
  const targets =
    new Map(
      model.targets.map(
        (target) => [
          target.key,
          target,
        ],
      ),
    );

  const locatorArtifacts =
    proposal.artifacts.filter(
      (artifact) =>
        artifact.type === 'locator' &&
        artifact.change !== 'REUSE',
    );

  for (const artifact of locatorArtifacts) {
    const getters =
      artifact.owns.map(
        (targetKey) => {
          const target =
            targets.get(targetKey);

          if (!target) {
            throw new Error(
              `Unknown canonical target: ${targetKey}`,
            );
          }

          return [
            `  get ${getterName(targetKey)}() {`,
            `    return ${compileLocatorExpression(target)};`,
            `  }`,
          ].join('\n');
        },
      );

    const content = [
      `import type { Page } from '@playwright/test';`,
      ``,
      `export class ${artifact.name} {`,
      `  constructor(private readonly page: Page) {}`,
      ``,
      getters.join('\n\n'),
      `}`,
      ``,
    ].join('\n');

    const destination =
      path.resolve(
        sandboxRoot,
        artifact.path,
      );

    fs.mkdirSync(
      path.dirname(destination),
      {
        recursive: true,
      },
    );

    fs.writeFileSync(
      destination,
      content,
      'utf-8',
    );
  }
}
