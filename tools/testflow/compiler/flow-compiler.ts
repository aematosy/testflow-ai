import type {
  RecordedAction,
  TestFlowRecording,
} from '../schema/testflow-recording';

import type {
  CanonicalAction,
  CanonicalLocator,
  CanonicalTarget,
  CanonicalTestFlow,
} from '../model/canonical-model';

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

function optionalString(
  value: unknown,
): string | undefined {
  return typeof value === 'string'
    ? value
    : undefined;
}

function findAutomationAction(
  recording: TestFlowRecording,
  sequence: number,
): JsonObject | undefined {
  const actions =
    recording.automationProfile?.actions;

  if (!Array.isArray(actions)) {
    return undefined;
  }

  return actions.find(
    (candidate) =>
      isObject(candidate) &&
      candidate.sequence === sequence,
  ) as JsonObject | undefined;
}

function toLocator(
  value: unknown,
): CanonicalLocator | undefined {
  if (!isObject(value)) {
    return undefined;
  }

  if (
    typeof value.kind !== 'string' ||
    typeof value.value !== 'string'
  ) {
    return undefined;
  }

  return {
    kind: value.kind,
    value: value.value,
    strategy: optionalString(
      value.strategy,
    ),
    robustness: optionalString(
      value.robustness,
    ),
  };
}

function buildTarget(
  action: RecordedAction,
  automationAction?: JsonObject,
): CanonicalTarget | undefined {
  const element = isObject(action.element)
    ? action.element
    : undefined;

  const fingerprint =
    automationAction &&
    isObject(automationAction.targetFingerprint)
      ? automationAction.targetFingerprint
      : undefined;

  const attributes =
    fingerprint &&
    isObject(fingerprint.stableAttributes)
      ? fingerprint.stableAttributes
      : element &&
          isObject(element.attributes)
        ? element.attributes
        : {};

  const semanticName =
    optionalString(
      automationAction?.name,
    ) ??
    optionalString(
      fingerprint?.semanticName,
    ) ??
    optionalString(
      element?.semanticName,
    );

  if (!semanticName) {
    return undefined;
  }

  const rawTargetKey =
    optionalString(
      automationAction?.targetKey,
    );

  const targetKey =
    rawTargetKey ??
    semanticName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_');

  const playwright =
    automationAction &&
    isObject(
      automationAction.playwrightTypeScript,
    )
      ? automationAction.playwrightTypeScript
      : undefined;

  const primaryLocator =
    toLocator(
      automationAction?.primaryLocator,
    ) ??
    toLocator(
      element?.recommendedLocator,
    );

  return {
    key: targetKey,
    semanticName,
    role:
      optionalString(fingerprint?.role) ??
      optionalString(element?.role),
    label:
      optionalString(fingerprint?.label) ??
      optionalString(element?.label),

    attributes: {
      id: optionalString(attributes.id),
      name: optionalString(attributes.name),
      placeholder:
        optionalString(
          attributes.placeholder,
        ),
      testId:
        optionalString(attributes.testId),
      ariaLabel:
        optionalString(
          attributes.ariaLabel,
        ),
    },

    preferredLocator: primaryLocator,

    playwright: playwright
      ? {
          preferredStrategy:
            optionalString(
              playwright.preferredStrategy,
            ),
          preferred:
            optionalString(
              playwright.preferred,
            ),
          locatorFallback:
            optionalString(
              playwright.locatorFallback,
            ),
          interactionTemplate:
            optionalString(
              playwright.interactionTemplate,
            ),
        }
      : undefined,
  };
}

function buildAction(
  action: RecordedAction,
  automationAction?: JsonObject,
): CanonicalAction {
  const assertion =
    isObject(action.assertion)
      ? action.assertion
      : undefined;

  return {
    sequence: action.sequence,
    type: action.action,
    name:
      optionalString(
        automationAction?.name,
      ) ??
      optionalString(
        isObject(action.element)
          ? action.element.semanticName
          : undefined,
      ) ??
      `Action ${action.sequence}`,

    targetKey:
      optionalString(
        automationAction?.targetKey,
      ),

    sensitive:
      action.sensitive === true,

    skipped:
      action.skip === true,

    value:
      action.sensitive === true
        ? undefined
        : optionalString(action.value),

    assertion: assertion
      ? {
          type:
            optionalString(
              assertion.type,
            ),
          expected:
            assertion.expected,
        }
      : undefined,
  };
}

export function compileRecording(
  recording: TestFlowRecording,
): CanonicalTestFlow {
  const rawActions = new Map(
    recording.actions.map(
      (action) => [
        action.sequence,
        action,
      ],
    ),
  );

  const targets =
    new Map<string, CanonicalTarget>();

  const steps = recording.steps.map(
    (step) => {
      const actions: CanonicalAction[] = [];

      for (
        const sequence of step.actions
      ) {
        const rawAction =
          rawActions.get(sequence);

        if (!rawAction) {
          continue;
        }

        const automationAction =
          findAutomationAction(
            recording,
            sequence,
          );

        const target =
          buildTarget(
            rawAction,
            automationAction,
          );

        if (
          target &&
          !targets.has(target.key)
        ) {
          targets.set(
            target.key,
            target,
          );
        }

        actions.push(
          buildAction(
            rawAction,
            automationAction,
          ),
        );
      }

      return {
        id: step.id,
        name: step.name,
        page: step.page,
        actions,
      };
    },
  );

  const allActions =
    steps.flatMap(
      (step) => step.actions,
    );

  return {
    modelVersion: '1.0',

    recording: {
      schemaVersion:
        recording.schemaVersion,
      sessionId:
        recording.session.id,
      sessionName:
        recording.session.name,
      generatedAt:
        recording.generatedAt,
    },

    application: {
      origin:
        recording.session.sourceOrigin,
      language:
        recording.language,
    },

    steps,

    targets: [
      ...targets.values(),
    ],

    statistics: {
      steps: steps.length,
      actions: allActions.length,
      assertions:
        allActions.filter(
          (action) =>
            action.type === 'assert',
        ).length,
      sensitiveActions:
        allActions.filter(
          (action) =>
            action.sensitive,
        ).length,
      skippedActions:
        allActions.filter(
          (action) =>
            action.skipped,
        ).length,
      uniqueTargets:
        targets.size,
    },
  };
}
