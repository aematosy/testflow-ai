import type {
  CanonicalTestFlow,
} from '../model/canonical-model';

import type {
  GenerationManifest,
} from './manifest/generation-manifest';

export interface GenerationPolicyIssue {
  file: string;
  message: string;
}

export interface GenerationPolicyValidation {
  valid: boolean;
  errors: GenerationPolicyIssue[];
}

function isRuntimeSource(
  filePath: string,
): boolean {
  return (
    filePath.startsWith('src/') ||
    filePath.startsWith('tests/e2e/')
  );
}

function isTest(
  filePath: string,
): boolean {
  return (
    filePath.startsWith(
      'tests/e2e/',
    ) &&
    filePath.endsWith(
      '.spec.ts',
    )
  );
}

function recordedValues(
  model: CanonicalTestFlow,
): string[] {
  return model.steps
    .flatMap(
      (step) =>
        step.actions,
    )
    .filter(
      (action) =>
        !action.sensitive &&
        typeof action.value ===
          'string' &&
        action.value.length > 0,
    )
    .map(
      (action) =>
        action.value as string,
    );
}

export function validateGenerationPolicy(
  manifest: GenerationManifest,
  model: CanonicalTestFlow,
): GenerationPolicyValidation {
  const errors:
    GenerationPolicyIssue[] = [];

  const values =
    recordedValues(
      model,
    );

  for (const file of manifest.files) {
    if (
      !isRuntimeSource(
        file.path,
      )
    ) {
      continue;
    }

    if (
      /https?:\/\/[^\s"'`]+/.test(
        file.content,
      )
    ) {
      errors.push({
        file:
          file.path,
        message:
          'Absolute application URL is forbidden. Use Playwright baseURL and relative navigation.',
      });
    }

    if (
      /\bwaitForTimeout\s*\(/.test(
        file.content,
      )
    ) {
      errors.push({
        file:
          file.path,
        message:
          'Hard waits are forbidden.',
      });
    }

    if (
      /page\.(locator|querySelector)\s*\(/.test(
        file.content,
      ) &&
      !file.path.startsWith(
        'src/locators/',
      )
    ) {
      errors.push({
        file:
          file.path,
        message:
          'Raw locator usage outside locator artifacts is forbidden.',
      });
    }

    if (isTest(file.path)) {
      for (const value of values) {
        if (
          value.length >= 3 &&
          file.content.includes(
            value,
          )
        ) {
          errors.push({
            file:
              file.path,
            message:
              `Recorded runtime value was embedded in test source: ${JSON.stringify(
                value,
              )}`,
          });
        }
      }
    }
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
}
