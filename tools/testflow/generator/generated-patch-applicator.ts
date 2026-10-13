import fs from 'node:fs';
import path from 'node:path';

import type {
  ApprovedPlan,
} from '../approval/approved-plan';

export interface AppliedArtifact {
  operation:
    | 'CREATE'
    | 'MODIFY';

  path: string;
}

export function applyGeneratedPatch(
  approved: ApprovedPlan,
  sandboxRoot: string,
  repositoryRoot: string = process.cwd(),
): AppliedArtifact[] {
  const applied:
    AppliedArtifact[] = [];

  for (
    const artifact of
    approved.proposal.artifacts
  ) {
    if (
      artifact.change === 'REUSE'
    ) {
      continue;
    }

    const source =
      path.resolve(
        sandboxRoot,
        artifact.path,
      );

    const destination =
      path.resolve(
        repositoryRoot,
        artifact.path,
      );

    const relative =
      path.relative(
        repositoryRoot,
        destination,
      );

    if (
      relative.startsWith('..') ||
      path.isAbsolute(relative)
    ) {
      throw new Error(
        `Destination escapes repository: ${artifact.path}`,
      );
    }

    if (!fs.existsSync(source)) {
      throw new Error(
        `Validated sandbox artifact is missing: ${artifact.path}`,
      );
    }

    if (
      artifact.change === 'CREATE' &&
      fs.existsSync(destination)
    ) {
      throw new Error(
        `CREATE would overwrite existing file: ${artifact.path}`,
      );
    }

    if (
      artifact.change === 'MODIFY' &&
      !fs.existsSync(destination)
    ) {
      throw new Error(
        `MODIFY target disappeared: ${artifact.path}`,
      );
    }

    fs.mkdirSync(
      path.dirname(destination),
      {
        recursive: true,
      },
    );

    fs.copyFileSync(
      source,
      destination,
    );

    applied.push({
      operation:
        artifact.change,
      path:
        artifact.path,
    });
  }

  return applied;
}
