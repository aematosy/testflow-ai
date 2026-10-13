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
        ],
        request.sandboxRoot,
      );

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
