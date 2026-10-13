import path from 'node:path';

import {
  compileRecording,
} from '../../compiler/flow-compiler';

import {
  storeCanonicalModel,
} from '../../compiler/model-store';

import {
  readRecording,
} from '../../recordings/recording-reader';

import {
  asRecording,
  validateRecording,
} from '../../schema/recording-validator';

export function runInspect(
  inputPath?: string,
): number {
  if (!inputPath) {
    console.error(
      '\nUsage: testflow inspect <recording.json>\n',
    );

    return 1;
  }

  try {
    const document =
      readRecording(inputPath);

    const validation =
      validateRecording(
        document.value,
      );

    if (!validation.valid) {
      console.error(
        '\nRecording is invalid. Run testflow validate first.\n',
      );

      return 1;
    }

    const recording =
      asRecording(
        document.value,
      );

    const model =
      compileRecording(
        recording,
      );

    const id =
      `TF-${recording.session.id}`;

    const modelPath =
      storeCanonicalModel(
        id,
        model,
      );

    console.log('\nTestFlow Inspect');
    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      `Application          ${model.application.origin}`,
    );

    console.log(
      `Session              ${model.recording.sessionName}`,
    );

    console.log(
      `Schema               ${model.recording.schemaVersion}`,
    );

    console.log(
      `Model                ${model.modelVersion}`,
    );

    console.log(
      `Steps                ${model.statistics.steps}`,
    );

    console.log(
      `Actions              ${model.statistics.actions}`,
    );

    console.log(
      `Assertions           ${model.statistics.assertions}`,
    );

    console.log(
      `Unique targets       ${model.statistics.uniqueTargets}`,
    );

    console.log(
      `Sensitive actions    ${model.statistics.sensitiveActions}`,
    );

    console.log(
      `Skipped actions      ${model.statistics.skippedActions}`,
    );

    console.log(
      '\nFunctional flow',
    );

    for (const step of model.steps) {
      console.log(
        `\n  ${step.name}`,
      );

      for (
        const action of step.actions
      ) {
        const target =
          action.targetKey
            ? ` [${action.targetKey}]`
            : '';

        console.log(
          `    ${String(
            action.sequence,
          ).padStart(2, '0')}  ` +
          `${action.type.padEnd(8)} ` +
          `${action.name}${target}`,
        );
      }
    }

    console.log(
      '\nCanonical model',
    );

    console.log(
      `  ${path.relative(
        process.cwd(),
        modelPath,
      )}`,
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      '\nInspection completed.\n',
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nInspection failed: ${message}\n`,
    );

    return 1;
  }
}
