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

export function parseArchitectureProposal(
  raw: string,
): ArchitectureProposal {
  let value: unknown;

  try {
    value = JSON.parse(raw);
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

  if (value.version !== '1.0') {
    throw new Error(
      'Planner proposal version must be 1.0.',
    );
  }

  if (
    typeof value.recordingId !==
    'string'
  ) {
    throw new Error(
      'Planner proposal requires recordingId.',
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
