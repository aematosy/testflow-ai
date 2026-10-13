import fs from 'node:fs';
import path from 'node:path';

import {
  createImplementationPlan,
} from '../../planner/implementation-planner';

import {
  storeImplementationPlan,
} from '../../planner/plan-store';

import type {
  CanonicalTestFlow,
} from '../../model/canonical-model';

import type {
  RepositoryKnowledgeModel,
} from '../../repository/repository-model';

import {
  resolveProjectPaths,
} from '../../core/project-paths';

function readJson<T>(
  filePath: string,
): T {
  return JSON.parse(
    fs.readFileSync(
      filePath,
      'utf-8',
    ),
  ) as T;
}

export function runPlan(
  modelPath?: string,
): number {
  if (!modelPath) {
    console.error(
      '\nUsage: testflow plan <canonical-model.json>\n',
    );

    return 1;
  }

  try {
    const absoluteModel =
      path.resolve(modelPath);

    if (
      !fs.existsSync(absoluteModel)
    ) {
      throw new Error(
        `Canonical model not found: ${absoluteModel}`,
      );
    }

    const paths =
      resolveProjectPaths();

    const indexPath =
      path.join(
        paths.index,
        'repository.index.json',
      );

    if (
      !fs.existsSync(indexPath)
    ) {
      throw new Error(
        'Repository index not found. Run testflow index first.',
      );
    }

    const model =
      readJson<CanonicalTestFlow>(
        absoluteModel,
      );

    const repository =
      readJson<RepositoryKnowledgeModel>(
        indexPath,
      );

    const plan =
      createImplementationPlan(
        model,
        repository,
      );

    const destination =
      storeImplementationPlan(
        plan,
      );

    console.log(
      '\nTestFlow Implementation Plan',
    );

    console.log(
      '════════════════════════════════════════',
    );

    for (
      const change of [
        'REUSE',
        'MODIFY',
        'CREATE',
      ] as const
    ) {
      const artifacts =
        plan.artifacts.filter(
          (artifact) =>
            artifact.change ===
            change,
        );

      console.log(
        `\n${change}`,
      );

      if (
        artifacts.length === 0
      ) {
        console.log('  none');
        continue;
      }

      for (
        const artifact of artifacts
      ) {
        console.log(
          `  [${artifact.type}] ` +
          `${artifact.name}`,
        );

        console.log(
          `    ${artifact.path}`,
        );

        console.log(
          `    ${artifact.reason}`,
        );
      }
    }

    console.log(
      '\nSAFETY POLICY',
    );

    console.log(
      '  Delete existing files       FORBIDDEN',
    );

    console.log(
      '  Delete existing methods     FORBIDDEN',
    );

    console.log(
      '  Rename existing APIs        FORBIDDEN',
    );

    console.log(
      '  Replace existing files      FORBIDDEN',
    );

    console.log(
      '\nSUMMARY',
    );

    console.log(
      `  Reuse     ${plan.summary.reuse}`,
    );

    console.log(
      `  Modify    ${plan.summary.modify}`,
    );

    console.log(
      `  Create    ${plan.summary.create}`,
    );

    console.log(
      `  Delete    ${plan.summary.delete}`,
    );

    console.log(
      '\nPlan',
    );

    console.log(
      `  ${path.relative(
        process.cwd(),
        destination,
      )}`,
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      '\nNo repository files were modified.\n',
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nPlanning failed: ${message}\n`,
    );

    return 1;
  }
}
