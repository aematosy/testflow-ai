import fs from 'node:fs';
import path from 'node:path';

import type {
  ApprovedPlan,
} from '../../approval/approved-plan';

import {
  validateApprovedBaseline,
} from '../../approval/baseline-validator';

import {
  applyGeneratedPatch,
} from '../../generator/generated-patch-applicator';

import {
  validateGeneratedPatch,
} from '../../generator/patch-guard';

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

export function runApply(
  approvedPath?: string,
  sandboxRoot?: string,
): number {
  if (
    !approvedPath ||
    !sandboxRoot
  ) {
    console.error(
      '\nUsage: testflow apply <approved.json> <sandbox>\n',
    );

    return 1;
  }

  try {
    const approved =
      readJson<ApprovedPlan>(
        path.resolve(
          approvedPath,
        ),
      );

    const sandbox =
      path.resolve(
        sandboxRoot,
      );

    if (!fs.existsSync(sandbox)) {
      throw new Error(
        `Sandbox not found: ${sandbox}`,
      );
    }

    const baseline =
      validateApprovedBaseline(
        approved,
      );

    if (!baseline.valid) {
      console.error(
        '\nAPPLY BLOCKED: repository baseline changed.',
      );

      for (
        const error of baseline.errors
      ) {
        console.error(
          `  ${error}`,
        );
      }

      console.error();
      return 1;
    }

    /*
     * Never trust that a sandbox remains unchanged
     * after preview. Validate it again immediately
     * before applying.
     */
    const patch =
      validateGeneratedPatch(
        approved,
        process.cwd(),
        sandbox,
      );

    if (!patch.valid) {
      console.error(
        '\nAPPLY BLOCKED: sandbox no longer matches approved plan.',
      );

      for (
        const error of patch.errors
      ) {
        console.error(
          `  ${error}`,
        );
      }

      console.error();
      return 1;
    }

    const applied =
      applyGeneratedPatch(
        approved,
        sandbox,
      );

    console.log(
      '\nTestFlow Apply',
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      `Recording       ${approved.proposal.recordingId}`,
    );

    console.log(
      `Applied         ${applied.length}`,
    );

    console.log(
      '\nCHANGES',
    );

    for (
      const artifact of applied
    ) {
      console.log(
        `  ${artifact.operation.padEnd(8)} ${artifact.path}`,
      );
    }

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      '\nApplied successfully.',
    );

    console.log(
      'Changes are NOT committed.\n',
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nApply failed: ${message}\n`,
    );

    return 1;
  }
}
