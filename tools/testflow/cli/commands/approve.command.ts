import fs from 'node:fs';
import path from 'node:path';

import type {
  ArchitectureProposal,
} from '../../agents/architecture-proposal';

import type {
  ApprovedPlan,
} from '../../approval/approved-plan';

import {
  getGitBaseline,
} from '../../approval/git-baseline';

import {
  validateArchitectureProposal,
} from '../../guards/proposal-validator';

import {
  indexRepository,
} from '../../indexer/repository-indexer';

function readProposal(
  proposalPath: string,
): ArchitectureProposal {
  return JSON.parse(
    fs.readFileSync(
      proposalPath,
      'utf-8',
    ),
  ) as ArchitectureProposal;
}

export function runApprove(
  proposalPath?: string,
): number {
  if (!proposalPath) {
    console.error(
      '\nUsage: testflow approve <proposal.json>\n',
    );

    return 1;
  }

  try {
    const absolute =
      path.resolve(
        proposalPath,
      );

    if (!fs.existsSync(absolute)) {
      throw new Error(
        `Proposal not found: ${absolute}`,
      );
    }

    const proposal =
      readProposal(
        absolute,
      );

    /*
     * Never trust a previous validation result.
     * Approval always validates against the
     * repository as it exists NOW.
     */
    const repository =
      indexRepository();

    const validation =
      validateArchitectureProposal(
        proposal,
        repository,
      );

    if (!validation.valid) {
      console.error(
        '\nApproval blocked: proposal is no longer valid.\n',
      );

      for (
        const error of validation.errors
      ) {
        console.error(
          `ERROR: ${error.artifact ?? 'proposal'}: ` +
          error.message,
        );
      }

      return 1;
    }

    const baseline =
      getGitBaseline();

    if (!baseline.clean) {
      console.error(
        '\nApproval blocked: repository working tree is not clean.',
      );

      console.error(
        'Commit or revert current framework changes before approving a plan.\n',
      );

      return 1;
    }

    const approvedBy =
      process.env.USER ??
      process.env.LOGNAME ??
      'unknown';

    const approved:
      ApprovedPlan = {
        version: '1.0',

        proposal,

        approval: {
          approved: true,
          approvedAt:
            new Date().toISOString(),
          approvedBy,
        },

        repositoryBaseline: {
          gitCommit:
            baseline.gitCommit,
          gitTree:
            baseline.gitTree,
          clean:
            baseline.clean,
        },
      };

    const destination =
      absolute.replace(
        /\.proposal\.json$/,
        '.approved.json',
      );

    fs.writeFileSync(
      destination,
      JSON.stringify(
        approved,
        null,
        2,
      ) + '\n',
      'utf-8',
    );

    console.log(
      '\nTestFlow Approval Gate',
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      `Recording       ${proposal.recordingId}`,
    );

    console.log(
      `Artifacts       ${proposal.artifacts.length}`,
    );

    console.log(
      `Git commit      ${baseline.gitCommit}`,
    );

    console.log(
      `Git tree        ${baseline.gitTree}`,
    );

    console.log(
      'Repository      CLEAN',
    );

    console.log(
      '\nAUTHORIZED OPERATIONS',
    );

    for (
      const change of [
        'REUSE',
        'MODIFY',
        'CREATE',
      ] as const
    ) {
      const artifacts =
        proposal.artifacts.filter(
          (artifact) =>
            artifact.change === change,
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
          `  [${artifact.type}] ${artifact.name}`,
        );

        console.log(
          `    ${artifact.path}`,
        );
      }
    }

    console.log(
      '\nFORBIDDEN',
    );

    console.log(
      '  DELETE existing code',
    );

    console.log(
      '  RENAME existing APIs',
    );

    console.log(
      '  REPLACE existing files',
    );

    console.log(
      '\nApproved plan',
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
      '\nAPPROVED: Generator may consume this exact plan.\n',
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nApproval failed: ${message}\n`,
    );

    return 1;
  }
}
