import fs from 'node:fs';
import path from 'node:path';

import type {
  ApprovedPlan,
} from '../../approval/approved-plan';

import {
  validateApprovedBaseline,
} from '../../approval/baseline-validator';

import {
  createGeneratorSandbox,
} from '../../generator/sandbox/generator-sandbox';

import {
  validateGeneratedPatch,
} from '../../generator/patch-guard';

import type {
  CanonicalTestFlow,
} from '../../model/canonical-model';

import {
  CopilotGeneratorProvider,
} from '../../providers/copilot-generator.provider';

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

export async function runGeneratePreview(
  approvedPath?: string,
  modelPath?: string,
): Promise<number> {
  if (
    !approvedPath ||
    !modelPath
  ) {
    console.error(
      '\nUsage: testflow generate-preview <approved.json> <model.json>\n',
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

    const model =
      readJson<CanonicalTestFlow>(
        path.resolve(
          modelPath,
        ),
      );

    const baseline =
      validateApprovedBaseline(
        approved,
      );

    if (!baseline.valid) {
      console.log(
        '\nTestFlow Generator Preview',
      );

      console.log(
        '════════════════════════════════════════',
      );

      console.log(
        '\nBLOCKED: approved repository baseline changed.',
      );

      for (
        const error of baseline.errors
      ) {
        console.log(
          `  ${error}`,
        );
      }

      console.log();
      return 1;
    }

    const sandbox =
      createGeneratorSandbox();

    const provider =
      new CopilotGeneratorProvider();

    console.log(
      '\nTestFlow Generator Preview',
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      'Provider          copilot',
    );

    console.log(
      `Recording         ${approved.proposal.recordingId}`,
    );

    console.log(
      `Authorized        ${approved.proposal.artifacts.length}`,
    );

    console.log(
      `Sandbox           ${sandbox}`,
    );

    console.log(
      '\nGenerating candidate implementation...',
    );

    const generationStartedAt =
      Date.now();

    await provider.generate({
      approvedPlan:
        approved,
      model,
      sandboxRoot:
        sandbox,
    });

    const generationDurationMs =
      Date.now() -
      generationStartedAt;

    console.log(
      `Generation time    ${(
        generationDurationMs /
        1000
      ).toFixed(1)}s`,
    );

    const patch =
      validateGeneratedPatch(
        approved,
        process.cwd(),
        sandbox,
      );

    console.log(
      '\nGENERATED CHANGES',
    );

    if (
      patch.changes.length === 0
    ) {
      console.log(
        '  none',
      );
    }

    for (
      const change of patch.changes
    ) {
      console.log(
        `  ${change.operation.padEnd(8)} ${change.path}`,
      );
    }

    console.log(
      '\nPATCH VALIDATION',
    );

    console.log(
      `  Errors      ${patch.errors.length}`,
    );

    for (
      const error of patch.errors
    ) {
      console.log(
        `  ERROR: ${error}`,
      );
    }

    console.log(
      '════════════════════════════════════════',
    );

    if (!patch.valid) {
      console.log(
        '\nBLOCKED: generated candidate violated the approved plan.',
      );

      console.log(
        `Sandbox preserved for inspection:\n${sandbox}\n`,
      );

      return 1;
    }

    console.log(
      '\nPASSED: candidate matches the approved plan.',
    );

    console.log(
      'PREVIEW ONLY: repository was NOT modified.',
    );

    console.log(
      `Sandbox preserved for inspection:\n${sandbox}\n`,
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nGenerator preview failed: ${message}\n`,
    );

    return 1;
  }
}
