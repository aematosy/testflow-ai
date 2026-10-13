import type {
  ArchitectureProposal,
} from './architecture-proposal';

type JsonObject =
  Record<string, unknown>;

function isObject(
  value: unknown,
): value is JsonObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requiredString(
  object: JsonObject,
  property: string,
): void {
  if (
    typeof object[property] !== 'string' ||
    String(
      object[property],
    ).trim().length === 0
  ) {
    throw new Error(
      `Planner proposal requires ${property}.`,
    );
  }
}

export function parseArchitectureProposal(
  raw: string,
): ArchitectureProposal {
  let value: unknown;

  try {
    value =
      JSON.parse(raw);
  } catch {
    throw new Error(
      'Planner output is not valid JSON.',
    );
  }

  if (!isObject(value)) {
    throw new Error(
      'Planner proposal must be a JSON object.',
    );
  }

  if (
    value.version !== '1.0'
  ) {
    throw new Error(
      'Planner proposal version must be 1.0.',
    );
  }

  requiredString(
    value,
    'recordingId',
  );

  requiredString(
    value,
    'repositoryIndexVersion',
  );

  if (
    value.generatedBy !==
    'planner-agent' &&
    value.generatedBy !==
    'manual'
  ) {
    throw new Error(
      'Planner proposal generatedBy is invalid.',
    );
  }

  if (
    !Array.isArray(
      value.artifacts,
    )
  ) {
    throw new Error(
      'Planner proposal requires artifacts array.',
    );
  }

  if (
    !Array.isArray(
      value.forbiddenOperations,
    )
  ) {
    throw new Error(
      'Planner proposal requires forbiddenOperations.',
    );
  }

  return value as unknown as
    ArchitectureProposal;
}
