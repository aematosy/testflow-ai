import fs from 'node:fs';
import path from 'node:path';

import type {
  ArchitectureProposal,
} from '../../agents/architecture-proposal';

import {
  validateArchitectureProposal,
} from '../../guards/proposal-validator';

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

export function runValidatePlan(
  proposalPath?: string,
): number {
  if (!proposalPath) {
    console.error(
      '\nUsage: testflow validate-plan <proposal.json>\n',
    );

    return 1;
  }

  try {
    const proposalFile =
      path.resolve(
        proposalPath,
      );

    if (
      !fs.existsSync(
        proposalFile,
      )
    ) {
      throw new Error(
        `Proposal not found: ${proposalFile}`,
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
      !fs.existsSync(
        indexPath,
      )
    ) {
      throw new Error(
        'Repository index not found. Run testflow index first.',
      );
    }

    const proposal =
      readJson<ArchitectureProposal>(
        proposalFile,
      );

    const repository =
      readJson<RepositoryKnowledgeModel>(
        indexPath,
      );

    const result =
      validateArchitectureProposal(
        proposal,
        repository,
      );

    console.log(
      '\nTestFlow Proposal Validation',
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      `Artifacts           ${proposal.artifacts.length}`,
    );

    console.log(
      `Errors              ${result.errors.length}`,
    );

    console.log(
      `Warnings            ${result.warnings.length}`,
    );

    if (
      result.warnings.length > 0
    ) {
      console.log(
        '\nWARNINGS',
      );

      for (
        const issue of result.warnings
      ) {
        console.log(
          `  ${issue.artifact ?? 'proposal'}: ` +
          `${issue.message}`,
        );
      }
    }

    if (
      result.errors.length > 0
    ) {
      console.log(
        '\nBLOCKING ERRORS',
      );

      for (
        const issue of result.errors
      ) {
        console.log(
          `  ${issue.artifact ?? 'proposal'}: ` +
          `${issue.message}`,
        );
      }
    }

    console.log(
      '\nSAFETY',
    );

    console.log(
      '  Delete file       FORBIDDEN',
    );

    console.log(
      '  Delete method     FORBIDDEN',
    );

    console.log(
      '  Delete locator    FORBIDDEN',
    );

    console.log(
      '  Rename API        FORBIDDEN',
    );

    console.log(
      '  Replace file      FORBIDDEN',
    );

    console.log(
      '════════════════════════════════════════',
    );

    if (!result.valid) {
      console.log(
        '\nBLOCKED: proposal cannot reach Generator.\n',
      );

      return 1;
    }

    console.log(
      '\nPASSED: proposal is eligible for approval.\n',
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nProposal validation failed: ${message}\n`,
    );

    return 1;
  }
}
