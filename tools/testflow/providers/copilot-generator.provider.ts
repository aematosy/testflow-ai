import {
  buildGeneratorPrompt,
} from '../generator/generator-prompt';

import type {
  GeneratorProvider,
  GeneratorRequest,
  GeneratorResult,
} from '../generator/generator-provider';

import {
  runProcess,
} from './process/process-runner';

const GENERATOR_TIMEOUT_MS =
  180_000;

export class CopilotGeneratorProvider
implements GeneratorProvider {
  readonly name =
    'copilot';

  async generate(
    request:
      GeneratorRequest,
  ): Promise<GeneratorResult> {
    const prompt =
      buildGeneratorPrompt(
        request.approvedPlan,
        request.model,
      );

    const result =
      await runProcess(
        'copilot',
        [
          '--prompt',
          prompt,

          '--silent',

          '--no-ask-user',

          /*
           * Generator runs with the sandbox as cwd.
           *
           * It may edit files there, but it receives
           * no shell or browser permission.
           */
          '--available-tools',
          'write',

          '--allow-tool',
          'write',
        ],
        {
          cwd:
            request.sandboxRoot,

          timeoutMs:
            GENERATOR_TIMEOUT_MS,
        },
      );

    if (result.timedOut) {
      throw new Error(
        `Copilot generator timed out after ` +
        `${Math.round(
          result.durationMs / 1000,
        )} seconds.`,
      );
    }

    if (
      result.exitCode !== 0
    ) {
      throw new Error(
        [
          'Copilot generator failed.',
          result.stderr.trim(),
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }

    return {
      provider:
        this.name,
      sandboxRoot:
        request.sandboxRoot,
    };
  }
}
