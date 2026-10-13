import fs from 'node:fs';
import path from 'node:path';

export interface RecordingDocument {
  sourcePath: string;
  raw: string;
  value: unknown;
}

export function readRecording(
  inputPath: string,
): RecordingDocument {
  const sourcePath = path.resolve(inputPath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `Recording file does not exist: ${sourcePath}`,
    );
  }

  const stat = fs.statSync(sourcePath);

  if (!stat.isFile()) {
    throw new Error(
      `Recording path is not a file: ${sourcePath}`,
    );
  }

  const raw = fs.readFileSync(
    sourcePath,
    'utf-8',
  );

  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(
      `Recording is not valid JSON: ${sourcePath}`,
    );
  }

  return {
    sourcePath,
    raw,
    value,
  };
}
