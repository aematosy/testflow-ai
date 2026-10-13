import fs from 'node:fs';
import path from 'node:path';

import {
  createPlannerContext,
} from '../../agents/planner-context';

import {
  validateArchitectureProposal,
} from '../../guards/proposal-validator';

import {
  indexRepository,
} from '../../indexer/repository-indexer';

import type {
  CanonicalTestFlow,
} from '../../model/canonical-model';

import {
  PlannerOrchestrator,
} from '../../planner/planner-orchestrator';

import {
  validateLocatorOwnership,
} from '../../planner/locator-ownership-validator';

import {
  CopilotPlannerProvider,
} from '../../providers/copilot-planner.provider';

import {
  normalizeArchitectureProposal,
} from '../../naming/proposal-normalizer';

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

export async function runPlanAgent(
  modelPath?: string,
): Promise<number> {
  if (!modelPath) {
    console.error(
      '\nUsage: testflow plan-agent <canonical-model.json>\n',
    );

    return 1;
  }

  try {
    const absoluteModel =
      path.resolve(
        modelPath,
      );

    if (
      !fs.existsSync(
        absoluteModel,
      )
    ) {
      throw new Error(
        `Canonical model not found: ${absoluteModel}`,
      );
    }

    const model =
      readJson<CanonicalTestFlow>(
        absoluteModel,
      );

    /*
     * Always build a fresh repository model.
     *
     * The agent must never plan against a stale
     * repository index.
     */
    const repository =
      indexRepository();

    const context =
      createPlannerContext(
        model,
        repository,
      );

    const provider =
      new CopilotPlannerProvider();

    const orchestrator =
      new PlannerOrchestrator(
        provider,
      );

    const outputPath =
      path.resolve(
        '.testflow',
        'plans',
        `TF-${model.recording.sessionId}.proposal.json`,
      );

    fs.mkdirSync(
      path.dirname(
        outputPath,
      ),
      {
        recursive: true,
      },
    );

    console.log(
      '\nTestFlow Agent Planner',
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      'Provider             copilot',
    );

    console.log(
      `Recording            TF-${model.recording.sessionId}`,
    );

    console.log(
      `Actions              ${model.statistics.actions}`,
    );

    console.log(
      `Targets              ${model.statistics.uniqueTargets}`,
    );

    console.log(
      `Repository files     ${repository.statistics.files}`,
    );

    console.log(
      '\nPlanning...',
    );

    const result =
      await orchestrator.execute({
        context,
        instructionsPath:
          path.resolve(
            '.github/agents/testflow-planner.agent.md',
          ),
        outputPath,
      });

    const normalizedProposal =
      normalizeArchitectureProposal(
        result.proposal,
      );

    /*
     * The LLM decides ownership and architecture.
     * TestFlow decides repository naming conventions.
     */
    result.proposal =
      normalizedProposal;

    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        normalizedProposal,
        null,
        2,
      ) + '\n',
      'utf-8',
    );

    const validation =
      validateArchitectureProposal(
        normalizedProposal,
        repository,
      );

    const locatorOwnershipValidation =
      validateLocatorOwnership(
        normalizedProposal,
        model,
      );

    console.log(
      '\nARCHITECTURE PROPOSAL',
    );

    for (
      const change of [
        'REUSE',
        'MODIFY',
        'CREATE',
      ] as const
    ) {
      const artifacts =
        result.proposal.artifacts.filter(
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
        console.log(
          '  none',
        );
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

        console.log(
          `    confidence: ${artifact.confidence}`,
        );

        console.log(
          `    ${artifact.reason}`,
        );
      }
    }

    console.log(
      '\nVALIDATION',
    );

    const totalErrors =
      validation.errors.length +
      locatorOwnershipValidation.errors.length;

    console.log(
      `  Errors      ${totalErrors}`,
    );

    console.log(
      `  Warnings    ${validation.warnings.length}`,
    );

    for (
      const warning of validation.warnings
    ) {
      console.log(
        `  WARN: ${warning.artifact ?? 'proposal'}: ` +
        warning.message,
      );
    }

    for (
      const error of validation.errors
    ) {
      console.log(
        `  ERROR: ${error.artifact ?? 'proposal'}: ` +
        error.message,
      );
    }

    for (
      const error of
      locatorOwnershipValidation.errors
    ) {
      console.log(
        `  ERROR: locator ownership: ${error}`,
      );
    }

    console.log(
      '\nProposal',
    );

    console.log(
      `  ${path.relative(
        process.cwd(),
        outputPath,
      )}`,
    );

    console.log(
      '════════════════════════════════════════',
    );

    if (
      !validation.valid ||
      !locatorOwnershipValidation.valid
    ) {
      console.log(
        '\nBLOCKED: agent proposal failed deterministic validation.\n',
      );

      return 1;
    }

    console.log(
      '\nPASSED: proposal is eligible for human approval.',
    );

    console.log(
      'No repository files were modified.\n',
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nAgent planning failed: ${message}\n`,
    );

    return 1;
  }
}
