import type {
  GenerationManifest,
} from './generation-manifest';

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

export function parseGenerationManifest(
  raw: string,
): GenerationManifest {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(
      'Generator output is not valid JSON.',
    );
  }

  if (!isObject(value)) {
    throw new Error(
      'Generation manifest must be a JSON object.',
    );
  }

  if (value.version !== '1.0') {
    throw new Error(
      'Generation manifest version must be 1.0.',
    );
  }

  if (
    typeof value.recordingId !== 'string' ||
    value.recordingId.length === 0
  ) {
    throw new Error(
      'Generation manifest requires recordingId.',
    );
  }

  if (!Array.isArray(value.files)) {
    throw new Error(
      'Generation manifest requires files array.',
    );
  }

  for (
    const [index, file] of
    value.files.entries()
  ) {
    if (!isObject(file)) {
      throw new Error(
        `files[${index}] must be an object.`,
      );
    }

    if (
      file.operation !== 'CREATE' &&
      file.operation !== 'MODIFY'
    ) {
      throw new Error(
        `files[${index}] has invalid operation.`,
      );
    }

    if (
      typeof file.path !== 'string' ||
      file.path.length === 0
    ) {
      throw new Error(
        `files[${index}] requires path.`,
      );
    }

    if (
      typeof file.content !== 'string'
    ) {
      throw new Error(
        `files[${index}] requires content.`,
      );
    }
  }

  return value as unknown as
    GenerationManifest;
}
