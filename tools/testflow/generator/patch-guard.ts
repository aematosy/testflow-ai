import fs from 'node:fs';
import path from 'node:path';

import type {
  ApprovedPlan,
} from '../approval/approved-plan';

import {
  validateAstPreservation,
} from './ast-preservation-guard';

export interface GeneratedChange {
  path: string;
  operation:
    | 'CREATE'
    | 'MODIFY';
}

export interface PatchGuardResult {
  valid: boolean;
  changes: GeneratedChange[];
  errors: string[];
}

function collectFiles(
  root: string,
  relative = '',
): string[] {
  const absolute =
    path.join(
      root,
      relative,
    );

  if (
    !fs.existsSync(absolute)
  ) {
    return [];
  }

  const stat =
    fs.statSync(
      absolute,
    );

  if (stat.isFile()) {
    return [
      relative.replaceAll(
        '\\',
        '/',
      ),
    ];
  }

  return fs
    .readdirSync(absolute)
    .flatMap(
      (entry) =>
        collectFiles(
          root,
          path.join(
            relative,
            entry,
          ),
        ),
    );
}

function sameFile(
  left: string,
  right: string,
): boolean {
  if (
    !fs.existsSync(left) ||
    !fs.existsSync(right)
  ) {
    return false;
  }

  return fs
    .readFileSync(left)
    .equals(
      fs.readFileSync(right),
    );
}

export function validateGeneratedPatch(
  approvedPlan: ApprovedPlan,
  repositoryRoot: string,
  sandboxRoot: string,
): PatchGuardResult {
  const errors: string[] = [];

  const changes:
    GeneratedChange[] = [];

  const authorized =
    new Map(
      approvedPlan.proposal.artifacts.map(
        (artifact) => [
          artifact.path.replaceAll(
            '\\',
            '/',
          ),
          artifact.change,
        ],
      ),
    );

  const sandboxFiles =
    collectFiles(
      sandboxRoot,
    );

  const repositoryFiles = [
    ...collectFiles(
      repositoryRoot,
      'src',
    ),
    ...collectFiles(
      repositoryRoot,
      'tests',
    ),
  ];

  const sandboxFileSet =
    new Set(
      sandboxFiles,
    );

  for (
    const relativePath of repositoryFiles
  ) {
    if (
      !sandboxFileSet.has(
        relativePath,
      )
    ) {
      errors.push(
        `Existing file removed from generated sandbox: ${relativePath}`,
      );
    }
  }

  for (
    const relativePath of sandboxFiles
  ) {
    const sandboxFile =
      path.join(
        sandboxRoot,
        relativePath,
      );

    const repositoryFile =
      path.join(
        repositoryRoot,
        relativePath,
      );

    if (
      !fs.existsSync(
        repositoryFile,
      )
    ) {
      const authorization =
        authorized.get(
          relativePath,
        );

      if (
        authorization !==
        'CREATE'
      ) {
        errors.push(
          `Unauthorized created file: ${relativePath}`,
        );

        continue;
      }

      changes.push({
        path:
          relativePath,
        operation:
          'CREATE',
      });

      continue;
    }

    if (
      sameFile(
        repositoryFile,
        sandboxFile,
      )
    ) {
      continue;
    }

    const authorization =
      authorized.get(
        relativePath,
      );

    if (
      authorization !==
      'MODIFY'
    ) {
      errors.push(
        `Unauthorized modification: ${relativePath}`,
      );

      continue;
    }

    const astValidation =
      validateAstPreservation(
        repositoryFile,
        sandboxFile,
      );

    if (!astValidation.valid) {
      for (
        const error of astValidation.errors
      ) {
        errors.push(
          `${relativePath}: ${error}`,
        );
      }

      continue;
    }

    changes.push({
      path:
        relativePath,
      operation:
        'MODIFY',
    });
  }

  /*
   * Validate completeness of the approved plan.
   *
   * Safety is not only about preventing unauthorized
   * changes. Every approved CREATE and MODIFY must
   * actually be implemented.
   */
  const detectedChanges =
    new Map(
      changes.map(
        (change) => [
          change.path,
          change.operation,
        ],
      ),
    );

  for (
    const [
      artifactPath,
      change,
    ] of authorized
  ) {
    const sandboxFile =
      path.join(
        sandboxRoot,
        artifactPath,
      );

    const repositoryFile =
      path.join(
        repositoryRoot,
        artifactPath,
      );

    if (
      change === 'CREATE'
    ) {
      if (
        !fs.existsSync(
          sandboxFile,
        )
      ) {
        errors.push(
          `Approved CREATE was not generated: ${artifactPath}`,
        );

        continue;
      }

      if (
        detectedChanges.get(
          artifactPath,
        ) !== 'CREATE'
      ) {
        errors.push(
          `Approved CREATE was not detected as a created artifact: ${artifactPath}`,
        );
      }

      continue;
    }

    if (
      change === 'MODIFY'
    ) {
      if (
        !fs.existsSync(
          sandboxFile,
        )
      ) {
        errors.push(
          `Approved MODIFY target is missing from sandbox: ${artifactPath}`,
        );

        continue;
      }

      if (
        !fs.existsSync(
          repositoryFile,
        )
      ) {
        errors.push(
          `Approved MODIFY target does not exist in repository: ${artifactPath}`,
        );

        continue;
      }

      if (
        sameFile(
          repositoryFile,
          sandboxFile,
        )
      ) {
        errors.push(
          `Approved MODIFY was not implemented: ${artifactPath}`,
        );

        continue;
      }

      if (
        detectedChanges.get(
          artifactPath,
        ) !== 'MODIFY'
      ) {
        errors.push(
          `Approved MODIFY was not detected as a modified artifact: ${artifactPath}`,
        );
      }

      continue;
    }

    if (
      change === 'REUSE'
    ) {
      const sandboxFile =
        path.join(
          sandboxRoot,
          artifactPath,
        );

      const repositoryFile =
        path.join(
          repositoryRoot,
          artifactPath,
        );

      if (
        fs.existsSync(
          sandboxFile,
        ) &&
        fs.existsSync(
          repositoryFile,
        ) &&
        !sameFile(
          repositoryFile,
          sandboxFile,
        )
      ) {
        errors.push(
          `REUSE artifact was modified: ${artifactPath}`,
        );
      }
    }
  }

  return {
    valid:
      errors.length === 0,
    changes,
    errors,
  };
}
