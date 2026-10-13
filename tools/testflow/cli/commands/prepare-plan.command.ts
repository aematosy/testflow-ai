import fs from 'node:fs';
import path from 'node:path';

import {
  createPlannerContext,
} from '../../agents/planner-context';

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
  file: string,
): T {
  return JSON.parse(
    fs.readFileSync(
      file,
      'utf-8',
    ),
  ) as T;
}

export function runPreparePlan(
  modelPath?: string,
): number {
  if (!modelPath) {
    console.error(
      '\nUsage: testflow prepare-plan <canonical-model.json>\n',
    );

    return 1;
  }

  try {
    const paths =
      resolveProjectPaths();

    const repositoryPath =
      path.join(
        paths.index,
        'repository.index.json',
      );

    if (
      !fs.existsSync(repositoryPath)
    ) {
      throw new Error(
        'Repository index not found. Run testflow index first.',
      );
    }

    const model =
      readJson<CanonicalTestFlow>(
        path.resolve(modelPath),
      );

    const repository =
      readJson<RepositoryKnowledgeModel>(
        repositoryPath,
      );

    const context =
      createPlannerContext(
        model,
        repository,
      );

    const destination =
      path.join(
        paths.plans,
        `TF-${model.recording.sessionId}.planner-context.json`,
      );

    fs.mkdirSync(
      paths.plans,
      {
        recursive: true,
      },
    );

    fs.writeFileSync(
      destination,
      JSON.stringify(
        context,
        null,
        2,
      ) + '\n',
      'utf-8',
    );

    console.log(
      '\nTestFlow Planner Context',
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      `Recording actions     ${model.statistics.actions}`,
    );

    console.log(
      `Recording targets     ${model.statistics.uniqueTargets}`,
    );

    console.log(
      `Repository files      ${repository.statistics.files}`,
    );

    console.log(
      `Repository classes    ${repository.statistics.classes}`,
    );

    console.log(
      '\nConstraints',
    );

    console.log(
      '  REUSE -> MODIFY -> CREATE',
    );

    console.log(
      '  Destructive changes forbidden',
    );

    console.log(
      '  Locators separated',
    );

    console.log(
      '\nContext',
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
      '\nPlanner context prepared.\n',
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nPrepare plan failed: ${message}\n`,
    );

    return 1;
  }
}
