import type {
  ApprovedPlan,
} from '../../approval/approved-plan';

import type {
  GenerationManifest,
} from './generation-manifest';

export interface ManifestValidation {
  valid: boolean;
  errors: string[];
}

export function validateGenerationManifest(
  manifest: GenerationManifest,
  approved: ApprovedPlan,
): ManifestValidation {
  const errors: string[] = [];

  if (
    manifest.recordingId !==
    approved.proposal.recordingId
  ) {
    errors.push(
      'Manifest recordingId does not match approved plan.',
    );
  }

  const authorized =
    new Map(
      approved.proposal.artifacts
        .filter(
          (artifact) =>
            artifact.change !== 'REUSE',
        )
        .map(
          (artifact) => [
            artifact.path,
            artifact.change,
          ],
        ),
    );

  const received =
    new Set<string>();

  for (const file of manifest.files) {
    if (received.has(file.path)) {
      errors.push(
        `Duplicate generated file: ${file.path}`,
      );
      continue;
    }

    received.add(file.path);

    const expected =
      authorized.get(file.path);

    if (!expected) {
      errors.push(
        `Unauthorized generated file: ${file.path}`,
      );
      continue;
    }

    if (file.operation !== expected) {
      errors.push(
        `Operation mismatch for ${file.path}: ` +
        `expected ${expected}, received ${file.operation}`,
      );
    }
  }

  for (
    const [authorizedPath] of authorized
  ) {
    if (!received.has(authorizedPath)) {
      errors.push(
        `Approved artifact missing from manifest: ${authorizedPath}`,
      );
    }
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
}
