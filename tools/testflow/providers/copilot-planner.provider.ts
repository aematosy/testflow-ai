import fs from 'node:fs';
import path from 'node:path';

import {
  buildPlannerPrompt,
} from '../agents/planner-prompt';

import {
  parseArchitectureProposal,
} from '../agents/proposal-parser';

import {
  runProcess,
} from './process/process-runner';

import type {
  PlannerProvider,
  PlannerProviderRequest,
  PlannerProviderResult,
} from './planner-provider';

export class CopilotPlannerProvider
implements PlannerProvider {
  readonly name =
    'copilot';

  async plan(
    request:
      PlannerProviderRequest,
  ): Promise<PlannerProviderResult> {
    const prompt =
      buildPlannerPrompt(
        request.context,
        request.instructionsPath,
      );

    const result =
      await runProcess(
        'copilot',
        [
          '--prompt',
          prompt,
          '--silent',
          '--no-ask-user',
          '--available-tools',
        ],
      );

    if (
      result.exitCode !== 0
    ) {
      throw new Error(
        [
          'Copilot planner failed.',
          result.stderr.trim(),
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }

    const raw =
      result.stdout.trim();

    const rawPath =
      request.outputPath.replace(
        /\.json$/,
        '.raw.txt',
      );

    fs.mkdirSync(
      path.dirname(
        rawPath,
      ),
      {
        recursive: true,
      },
    );

    /*
     * Preserve provider output before parsing.
     *
     * Agent output is untrusted input and must remain
     * inspectable when contract validation fails.
     */
    fs.writeFileSync(
      rawPath,
      raw + '\n',
      'utf-8',
    );

    const proposal =
      parseArchitectureProposal(
        raw,
      );

    fs.writeFileSync(
      request.outputPath,
      JSON.stringify(
        proposal,
        null,
        2,
      ) + '\n',
      'utf-8',
    );

    return {
      proposal,
      provider:
        this.name,
    };
  }
}
