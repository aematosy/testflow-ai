import path from 'node:path';

import {
  readRecording,
} from '../../recordings/recording-reader';

import {
  storeRecording,
} from '../../recordings/recording-store';

import {
  asRecording,
  validateRecording,
} from '../../schema/recording-validator';

export function runImport(
  inputPath?: string,
): number {
  if (!inputPath) {
    console.error(
      '\nUsage: testflow import <recording.json>\n',
    );

    return 1;
  }

  try {
    const document = readRecording(
      inputPath,
    );

    const validation = validateRecording(
      document.value,
    );

    console.log('\nTestFlow Import');
    console.log(
      '════════════════════════════════════════',
    );

    if (!validation.valid) {
      console.log('Status              REJECTED');

      for (const error of validation.errors) {
        console.log(
          `ERROR  ${error.path}: ${error.message}`,
        );
      }

      console.log();
      return 1;
    }

    const recording = asRecording(
      document.value,
    );

    const stored = storeRecording(
      recording,
      document.raw,
    );

    console.log(
      `Schema              ${recording.schemaVersion}`,
    );

    console.log(
      `Session             ${recording.session.name}`,
    );

    console.log(
      `Origin              ${recording.session.sourceOrigin}`,
    );

    console.log(
      `Steps               ${recording.steps.length}`,
    );

    console.log(
      `Actions             ${recording.actions.length}`,
    );

    console.log(
      `Warnings            ${validation.warnings.length}`,
    );

    console.log(
      `ID                  ${stored.id}`,
    );

    console.log(
      `Stored              ${path.relative(
        process.cwd(),
        stored.path,
      )}`,
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      '\nRecording imported successfully.\n',
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nImport failed: ${message}\n`,
    );

    return 1;
  }
}
