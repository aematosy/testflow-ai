import fs from 'node:fs';
import path from 'node:path';

import type {
  TestFlowRecording,
} from '../schema/testflow-recording';

import {
  resolveProjectPaths,
} from '../core/project-paths';

export interface StoredRecording {
  id: string;
  path: string;
}

function sanitize(
  value: string,
): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function storeRecording(
  recording: TestFlowRecording,
  raw: string,
): StoredRecording {
  const paths = resolveProjectPaths();

  fs.mkdirSync(
    paths.recordings,
    {
      recursive: true,
    },
  );

  const sessionId = sanitize(
    recording.session.id,
  );

  const id = `TF-${sessionId}`;

  const destination = path.join(
    paths.recordings,
    `${id}.json`,
  );

  if (fs.existsSync(destination)) {
    const existing = fs.readFileSync(
      destination,
      'utf-8',
    );

    if (existing !== raw) {
      throw new Error(
        `Recording ${id} already exists with different content.`,
      );
    }

    return {
      id,
      path: destination,
    };
  }

  fs.writeFileSync(
    destination,
    raw,
    'utf-8',
  );

  return {
    id,
    path: destination,
  };
}
