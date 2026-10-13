import type {
  CanonicalTestFlow,
} from '../model/canonical-model';

import type {
  RepositoryArtifactType,
  RepositoryKnowledgeModel,
} from '../repository/repository-model';

import {
  findArtifact,
} from '../ownership/repository-matcher';

import {
  resolveOwnership,
} from '../ownership/ownership-resolver';

import {
  toKebabCase,
  toPascalCase,
} from '../ownership/naming';

import type {
  ArtifactType,
  ImplementationPlan,
  PlannedArtifact,
} from './implementation-plan';

function planArtifact(
  repository: RepositoryKnowledgeModel,
  type: ArtifactType,
  className: string,
  proposedPath: string,
): PlannedArtifact {
  const repositoryType:
    RepositoryArtifactType =
      type;

  const match =
    findArtifact(
      repository,
      className,
      repositoryType,
    );

  if (
    match.found &&
    match.confidence === 1
  ) {
    return {
      change: 'REUSE',
      type,
      name:
        match.className ??
        className,
      path:
        match.file ??
        proposedPath,
      reason:
        'Exact existing repository artifact match.',
      confidence:
        match.confidence,
    };
  }

  if (match.found) {
    return {
      change: 'MODIFY',
      type,
      name: className,
      path:
        match.file ??
        proposedPath,
      reason:
        'Existing artifact appears to own this functionality.',
      confidence:
        match.confidence,
    };
  }

  return {
    change: 'CREATE',
    type,
    name: className,
    path: proposedPath,
    reason:
      'No compatible existing repository artifact was found.',
    confidence: 1,
  };
}

function addOwnedArtifacts(
  model: CanonicalTestFlow,
  repository: RepositoryKnowledgeModel,
  artifacts: PlannedArtifact[],
): void {
  for (const step of model.steps) {
    const decision =
      resolveOwnership(step);

    const base =
      toPascalCase(
        decision.domainName,
      );

    const fileBase =
      toKebabCase(
        decision.domainName,
      );

    if (
      decision.ownership ===
      'component'
    ) {
      artifacts.push(
        planArtifact(
          repository,
          'locator',
          `${base}Locators`,
          `src/locators/${fileBase}.locators.ts`,
        ),
      );

      artifacts.push(
        planArtifact(
          repository,
          'component',
          `${base}Component`,
          `src/components/${fileBase}.component.ts`,
        ),
      );

      continue;
    }

    artifacts.push(
      planArtifact(
        repository,
        'locator',
        `${base}Locators`,
        `src/locators/${fileBase}.locators.ts`,
      ),
    );

    artifacts.push(
      planArtifact(
        repository,
        'page',
        `${base}Page`,
        `src/pages/${fileBase}.page.ts`,
      ),
    );
  }
}

export function createImplementationPlan(
  model: CanonicalTestFlow,
  repository: RepositoryKnowledgeModel,
): ImplementationPlan {
  const artifacts:
    PlannedArtifact[] = [];

  addOwnedArtifacts(
    model,
    repository,
    artifacts,
  );

  const deduplicated =
    Array.from(
      new Map(
        artifacts.map(
          (artifact) => [
            `${artifact.type}:${artifact.path}`,
            artifact,
          ],
        ),
      ).values(),
    );

  return {
    version: '1.0',

    recordingId:
      `TF-${model.recording.sessionId}`,

    generatedAt:
      new Date().toISOString(),

    policy: {
      destructiveChangesAllowed:
        false,
      deleteAllowed:
        false,
      renameAllowed:
        false,
      replaceAllowed:
        false,
    },

    artifacts:
      deduplicated,

    summary: {
      reuse:
        deduplicated.filter(
          (item) =>
            item.change === 'REUSE',
        ).length,

      modify:
        deduplicated.filter(
          (item) =>
            item.change === 'MODIFY',
        ).length,

      create:
        deduplicated.filter(
          (item) =>
            item.change === 'CREATE',
        ).length,

      delete: 0,
    },
  };
}
