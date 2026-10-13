import type {
  TestFlowRecording,
} from './testflow-recording';

import type {
  ValidationIssue,
  ValidationResult,
} from './validation-result';

type JsonObject = Record<string, unknown>;

function isObject(
  value: unknown,
): value is JsonObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function nonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0
  );
}

function requiredString(
  object: JsonObject,
  property: string,
  path: string,
  errors: ValidationIssue[],
): void {
  if (!nonEmptyString(object[property])) {
    errors.push({
      path: `${path}.${property}`,
      message: 'Expected a non-empty string.',
    });
  }
}

function validateSteps(
  steps: unknown,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
): Map<number, string> {
  const actionOwnership = new Map<number, string>();

  if (!Array.isArray(steps)) {
    errors.push({
      path: '$.steps',
      message: 'Expected steps array.',
    });

    return actionOwnership;
  }

  if (steps.length === 0) {
    warnings.push({
      path: '$.steps',
      message: 'Recording contains no functional steps.',
    });
  }

  const stepIds = new Set<string>();

  steps.forEach((step, index) => {
    const stepPath = `$.steps[${index}]`;

    if (!isObject(step)) {
      errors.push({
        path: stepPath,
        message: 'Expected step object.',
      });
      return;
    }

    requiredString(
      step,
      'id',
      stepPath,
      errors,
    );

    requiredString(
      step,
      'name',
      stepPath,
      errors,
    );

    requiredString(
      step,
      'page',
      stepPath,
      errors,
    );

    if (nonEmptyString(step.id)) {
      if (stepIds.has(step.id)) {
        errors.push({
          path: `${stepPath}.id`,
          message: `Duplicate step id: ${step.id}.`,
        });
      }

      stepIds.add(step.id);
    }

    if (!Array.isArray(step.actions)) {
      errors.push({
        path: `${stepPath}.actions`,
        message: 'Expected action sequence array.',
      });
      return;
    }

    for (const sequence of step.actions) {
      if (
        typeof sequence !== 'number' ||
        !Number.isInteger(sequence) ||
        sequence <= 0
      ) {
        errors.push({
          path: `${stepPath}.actions`,
          message:
            'Action sequences must be positive integers.',
        });
        continue;
      }

      if (actionOwnership.has(sequence)) {
        errors.push({
          path: `${stepPath}.actions`,
          message:
            `Action sequence ${sequence} belongs to more than one step.`,
        });
        continue;
      }

      if (nonEmptyString(step.id)) {
        actionOwnership.set(
          sequence,
          step.id,
        );
      }
    }
  });

  return actionOwnership;
}

function validateLocator(
  locator: unknown,
  path: string,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
): void {
  if (!isObject(locator)) {
    warnings.push({
      path,
      message: 'No recommended locator metadata.',
    });
    return;
  }

  requiredString(
    locator,
    'kind',
    path,
    errors,
  );

  requiredString(
    locator,
    'value',
    path,
    errors,
  );

  if (
    locator.matches !== undefined &&
    locator.matches !== 1
  ) {
    errors.push({
      path: `${path}.matches`,
      message:
        `Executable locator must resolve exactly one target; ` +
        `received ${String(locator.matches)}.`,
    });
  }

  if (
    locator.targetMatch !== undefined &&
    locator.targetMatch !== true
  ) {
    errors.push({
      path: `${path}.targetMatch`,
      message:
        'Executable locator must match the recorded target.',
    });
  }

  if (
    locator.uniqueness !== undefined &&
    locator.uniqueness !== '1/1'
  ) {
    errors.push({
      path: `${path}.uniqueness`,
      message:
        `Expected locator uniqueness 1/1; ` +
        `received ${String(locator.uniqueness)}.`,
    });
  }
}

function validateSensitiveValue(
  action: JsonObject,
  path: string,
  errors: ValidationIssue[],
): void {
  if (action.sensitive !== true) {
    return;
  }

  const value = action.value;

  if (
    typeof value === 'string' &&
    value.length > 0 &&
    value !== '***REDACTED***' &&
    value !== 'REDACTED'
  ) {
    errors.push({
      path: `${path}.value`,
      message:
        'Sensitive action contains an exported runtime value.',
    });
  }
}

function validateActions(
  actions: unknown,
  actionOwnership: Map<number, string>,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
): void {
  if (!Array.isArray(actions)) {
    errors.push({
      path: '$.actions',
      message: 'Expected actions array.',
    });
    return;
  }

  if (actions.length === 0) {
    warnings.push({
      path: '$.actions',
      message: 'Recording contains no actions.',
    });
  }

  const sequences = new Set<number>();

  actions.forEach((action, index) => {
    const actionPath = `$.actions[${index}]`;

    if (!isObject(action)) {
      errors.push({
        path: actionPath,
        message: 'Expected action object.',
      });
      return;
    }

    const sequence = action.sequence;

    if (
      typeof sequence !== 'number' ||
      !Number.isInteger(sequence) ||
      sequence <= 0
    ) {
      errors.push({
        path: `${actionPath}.sequence`,
        message:
          'Expected a positive integer sequence.',
      });
    } else {
      if (sequences.has(sequence)) {
        errors.push({
          path: `${actionPath}.sequence`,
          message:
            `Duplicate action sequence: ${sequence}.`,
        });
      }

      sequences.add(sequence);

      if (!actionOwnership.has(sequence)) {
        warnings.push({
          path: `${actionPath}.sequence`,
          message:
            `Sequence ${sequence} is not referenced by a functional step.`,
        });
      }

      const expectedStepId =
        actionOwnership.get(sequence);

      if (
        expectedStepId &&
        nonEmptyString(action.stepId) &&
        action.stepId !== expectedStepId
      ) {
        errors.push({
          path: `${actionPath}.stepId`,
          message:
            `Action belongs to ${expectedStepId}, ` +
            `but declares ${action.stepId}.`,
        });
      }
    }

    requiredString(
      action,
      'action',
      actionPath,
      errors,
    );

    validateSensitiveValue(
      action,
      actionPath,
      errors,
    );

    const element = action.element;

    if (!isObject(element)) {
      warnings.push({
        path: `${actionPath}.element`,
        message:
          'Action has no element metadata. ' +
          'Generation may require live discovery.',
      });
      return;
    }

    const fingerprintAvailable =
      nonEmptyString(element.semanticName) ||
      nonEmptyString(element.role) ||
      nonEmptyString(element.label) ||
      isObject(element.attributes);

    if (!fingerprintAvailable) {
      warnings.push({
        path: `${actionPath}.element`,
        message:
          'Target has insufficient semantic fingerprint evidence.',
      });
    }

    validateLocator(
      element.recommendedLocator,
      `${actionPath}.element.recommendedLocator`,
      errors,
      warnings,
    );
  });

  for (
    const [sequence] of actionOwnership
  ) {
    if (!sequences.has(sequence)) {
      errors.push({
        path: '$.steps',
        message:
          `Step references missing action sequence ${sequence}.`,
      });
    }
  }
}

function validateAutomationProfile(
  profile: unknown,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
): void {
  if (!isObject(profile)) {
    warnings.push({
      path: '$.automationProfile',
      message:
        'Automation profile is missing. ' +
        'Generation capabilities may be reduced.',
    });
    return;
  }

  if (!Array.isArray(profile.targetFrameworks)) {
    errors.push({
      path: '$.automationProfile.targetFrameworks',
      message:
        'Expected targetFrameworks array.',
    });
    return;
  }

  if (
    !profile.targetFrameworks.includes(
      'playwright-typescript',
    )
  ) {
    warnings.push({
      path: '$.automationProfile.targetFrameworks',
      message:
        'Recording does not explicitly target playwright-typescript.',
    });
  }
}

export function validateRecording(
  input: unknown,
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!isObject(input)) {
    return {
      valid: false,
      errors: [
        {
          path: '$',
          message:
            'Recording must be a JSON object.',
        },
      ],
      warnings,
    };
  }

  requiredString(
    input,
    'schemaVersion',
    '$',
    errors,
  );

  if (
    typeof input.schemaVersion === 'string' &&
    input.schemaVersion !== '2.1'
  ) {
    errors.push({
      path: '$.schemaVersion',
      message:
        `Unsupported schema version: ` +
        `${input.schemaVersion}. Expected 2.1.`,
    });
  }

  requiredString(
    input,
    'generatedAt',
    '$',
    errors,
  );

  if (!isObject(input.session)) {
    errors.push({
      path: '$.session',
      message: 'Expected session object.',
    });
  } else {
    requiredString(
      input.session,
      'id',
      '$.session',
      errors,
    );

    requiredString(
      input.session,
      'name',
      '$.session',
      errors,
    );

    requiredString(
      input.session,
      'sourceOrigin',
      '$.session',
      errors,
    );
  }

  const ownership = validateSteps(
    input.steps,
    errors,
    warnings,
  );

  validateActions(
    input.actions,
    ownership,
    errors,
    warnings,
  );

  validateAutomationProfile(
    input.automationProfile,
    errors,
    warnings,
  );

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function asRecording(
  input: unknown,
): TestFlowRecording {
  return input as TestFlowRecording;
}
