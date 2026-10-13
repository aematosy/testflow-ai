import {
  readRecording,
} from '../../recordings/recording-reader';

import {
  validateRecording,
} from '../../schema/recording-validator';

export function runValidate(
  inputPath?: string,
): number {
  if (!inputPath) {
    console.error(
      '\nUsage: testflow validate <recording.json>\n',
    );

    return 1;
  }

  try {
    const document = readRecording(
      inputPath,
    );

    const result = validateRecording(
      document.value,
    );

    console.log('\nTestFlow Validation');
    console.log(
      '════════════════════════════════════════',
    );

    for (const warning of result.warnings) {
      console.log(
        `WARN   ${warning.path}: ${warning.message}`,
      );
    }

    for (const error of result.errors) {
      console.log(
        `ERROR  ${error.path}: ${error.message}`,
      );
    }

    console.log(
      '════════════════════════════════════════',
    );

    if (!result.valid) {
      console.log(
        `\nFAILED: ${result.errors.length} error(s).\n`,
      );

      return 1;
    }

    console.log(
      `\nPASSED with ${result.warnings.length} warning(s).\n`,
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nValidation failed: ${message}\n`,
    );

    return 1;
  }
}
