import fs from 'node:fs';
import path from 'node:path';

import {
  buildGeneratorPrompt,
} from '../generator/generator-prompt';

import {
  materializeManifest,
} from '../generator/manifest/manifest-materializer';

import {
  parseGenerationManifest,
} from '../generator/manifest/manifest-parser';

import {
  validateGenerationManifest,
} from '../generator/manifest/manifest-validator';

import type {
  GeneratorProvider,
  GeneratorRequest,
  GeneratorResult,
} from '../generator/generator-provider';

import {
  runProcess,
} from './process/process-runner';

const GENERATOR_TIMEOUT_MS =
  120_000;

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
          '--available-tools',
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

    if (result.exitCode !== 0) {
      throw new Error(
        [
          'Copilot generator failed.',
          result.stderr.trim(),
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }

    const raw =
      result.stdout.trim();

    const diagnosticPath =
      `${request.sandboxRoot}.generator.raw.txt`;

    fs.writeFileSync(
      diagnosticPath,
      raw + '\n',
      'utf-8',
    );

    const manifest =
      parseGenerationManifest(
        raw,
      );

    const validation =
      validateGenerationManifest(
        manifest,
        request.approvedPlan,
      );

    if (!validation.valid) {
      throw new Error(
        [
          'Generation manifest rejected.',
          ...validation.errors,
          `Raw output: ${diagnosticPath}`,
        ].join('\n'),
      );
    }

    materializeManifest(
      manifest,
      request.sandboxRoot,
    );

    return {
      provider:
        this.name,
      sandboxRoot:
        request.sandboxRoot,
    };
  }
}
