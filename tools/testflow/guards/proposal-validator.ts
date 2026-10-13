import fs from 'node:fs';
import path from 'node:path';

import type {
  ArchitectureProposal,
  ArchitectureProposalArtifact,
} from '../agents/architecture-proposal';

import type {
  RepositoryKnowledgeModel,
} from '../repository/repository-model';

export interface ProposalIssue {
  severity: 'ERROR' | 'WARNING';
  artifact?: string;
  message: string;
}

export interface ProposalValidationResult {
  valid: boolean;
  errors: ProposalIssue[];
  warnings: ProposalIssue[];
}

const ALLOWED_CHANGES = new Set([
  'REUSE',
  'MODIFY',
  'CREATE',
]);

const ALLOWED_TYPES = new Set([
  'locator',
  'page',
  'component',
  'flow',
  'test',
]);

function normalize(
  value: string,
): string {
  return value
    .replaceAll('\\', '/')
    .replace(/^\.?\//, '');
}

function expectedPrefix(
  type: ArchitectureProposalArtifact['type'],
): string {
  switch (type) {
    case 'locator':
      return 'src/locators/';

    case 'page':
      return 'src/pages/';

    case 'component':
      return 'src/components/';

    case 'flow':
      return 'src/flows/';

    case 'test':
      return 'tests/';
  }
}

function repositoryHasFile(
  repository: RepositoryKnowledgeModel,
  filePath: string,
): boolean {
  const expected =
    normalize(filePath);

  return repository.files.some(
    (file) =>
      normalize(file.path) === expected,
  );
}

function repositoryHasClass(
  repository: RepositoryKnowledgeModel,
  className: string,
): boolean {
  return repository.files.some(
    (file) =>
      file.classes.some(
        (artifact) =>
          artifact.name === className,
      ),
  );
}

function validateArtifact(
  artifact: ArchitectureProposalArtifact,
  repository: RepositoryKnowledgeModel,
  errors: ProposalIssue[],
  warnings: ProposalIssue[],
): void {
  if (
    !ALLOWED_CHANGES.has(
      artifact.change,
    )
  ) {
    errors.push({
      severity: 'ERROR',
      artifact: artifact.name,
      message:
        `Unsupported change type: ${String(
          artifact.change,
        )}.`,
    });

    return;
  }

  if (
    !ALLOWED_TYPES.has(
      artifact.type,
    )
  ) {
    errors.push({
      severity: 'ERROR',
      artifact: artifact.name,
      message:
        `Unsupported artifact type: ${String(
          artifact.type,
        )}.`,
    });

    return;
  }

  const normalizedPath =
    normalize(
      artifact.path,
    );

  if (
    normalizedPath.includes('../')
  ) {
    errors.push({
      severity: 'ERROR',
      artifact: artifact.name,
      message:
        'Artifact path escapes the repository.',
    });
  }

  const prefix =
    expectedPrefix(
      artifact.type,
    );

  if (
    !normalizedPath.startsWith(prefix)
  ) {
    errors.push({
      severity: 'ERROR',
      artifact: artifact.name,
      message:
        `${artifact.type} must live under ${prefix}`,
    });
  }

  const fileExists =
    repositoryHasFile(
      repository,
      normalizedPath,
    );

  const classExists =
    repositoryHasClass(
      repository,
      artifact.name,
    );

  if (
    artifact.change === 'CREATE' &&
    (fileExists || classExists)
  ) {
    errors.push({
      severity: 'ERROR',
      artifact: artifact.name,
      message:
        'CREATE collides with an existing repository artifact. ' +
        'Planner must evaluate REUSE or MODIFY first.',
    });
  }

  if (
    artifact.change === 'MODIFY' &&
    !fileExists
  ) {
    errors.push({
      severity: 'ERROR',
      artifact: artifact.name,
      message:
        'MODIFY targets a file that does not exist in the repository index.',
    });
  }

  if (
    artifact.change === 'REUSE' &&
    !fileExists &&
    !classExists
  ) {
    errors.push({
      severity: 'ERROR',
      artifact: artifact.name,
      message:
        'REUSE references an artifact that does not exist.',
    });
  }

  if (
    artifact.change === 'MODIFY' &&
    !artifact.additions
  ) {
    errors.push({
      severity: 'ERROR',
      artifact: artifact.name,
      message:
        'MODIFY must explicitly declare additive changes.',
    });
  }

  if (
    artifact.confidence < 0 ||
    artifact.confidence > 1
  ) {
    errors.push({
      severity: 'ERROR',
      artifact: artifact.name,
      message:
        'Confidence must be between 0 and 1.',
    });
  }

  if (
    artifact.confidence < 0.7
  ) {
    warnings.push({
      severity: 'WARNING',
      artifact: artifact.name,
      message:
        'Low-confidence architecture decision requires review.',
    });
  }
}

export function validateArchitectureProposal(
  proposal: ArchitectureProposal,
  repository: RepositoryKnowledgeModel,
  root: string = process.cwd(),
): ProposalValidationResult {
  const errors: ProposalIssue[] = [];
  const warnings: ProposalIssue[] = [];

  if (
    proposal.version !== '1.0'
  ) {
    errors.push({
      severity: 'ERROR',
      message:
        `Unsupported proposal version: ${proposal.version}`,
    });
  }

  const forbidden =
    new Set(
      proposal.forbiddenOperations ?? [],
    );

  const requiredForbidden:
    ArchitectureProposal['forbiddenOperations'] = [
      'DELETE_EXISTING_FILE',
      'DELETE_EXISTING_METHOD',
      'DELETE_EXISTING_LOCATOR',
      'RENAME_EXISTING_API',
      'REPLACE_EXISTING_FILE',
    ];

  for (
    const operation of requiredForbidden
  ) {
    if (!forbidden.has(operation)) {
      errors.push({
        severity: 'ERROR',
        message:
          `Safety contract missing forbidden operation: ${operation}`,
      });
    }
  }

  const identities =
    new Set<string>();

  for (
    const artifact of proposal.artifacts
  ) {
    const identity =
      `${artifact.type}:${normalize(
        artifact.path,
      )}`;

    if (
      identities.has(identity)
    ) {
      errors.push({
        severity: 'ERROR',
        artifact: artifact.name,
        message:
          `Duplicate proposal artifact: ${identity}`,
      });

      continue;
    }

    identities.add(identity);

    validateArtifact(
      artifact,
      repository,
      errors,
      warnings,
    );

    const absolute =
      path.resolve(
        root,
        artifact.path,
      );

    const relative =
      path.relative(
        root,
        absolute,
      );

    if (
      relative.startsWith('..') ||
      path.isAbsolute(relative)
    ) {
      errors.push({
        severity: 'ERROR',
        artifact: artifact.name,
        message:
          'Resolved artifact path escapes repository root.',
      });
    }

    if (
      artifact.change === 'CREATE' &&
      fs.existsSync(absolute)
    ) {
      errors.push({
        severity: 'ERROR',
        artifact: artifact.name,
        message:
          'CREATE would overwrite an existing filesystem entry.',
      });
    }
  }

  return {
    valid:
      errors.length === 0,
    errors,
    warnings,
  };
}
