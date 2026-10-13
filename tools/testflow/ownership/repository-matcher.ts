import path from 'node:path';

import type {
  RepositoryArtifactType,
  RepositoryKnowledgeModel,
} from '../repository/repository-model';

export interface ArtifactMatch {
  found: boolean;
  className?: string;
  file?: string;
  confidence: number;
}

function normalize(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function findArtifact(
  repository: RepositoryKnowledgeModel,
  expectedClassName: string,
  expectedType: RepositoryArtifactType,
): ArtifactMatch {
  const expected =
    normalize(expectedClassName);

  for (const file of repository.files) {
    if (file.type !== expectedType) {
      continue;
    }

    for (const artifact of file.classes) {
      if (
        normalize(artifact.name) === expected
      ) {
        return {
          found: true,
          className: artifact.name,
          file: file.path,
          confidence: 1,
        };
      }
    }

    const basename =
      normalize(
        path.basename(
          file.path,
          path.extname(file.path),
        ),
      );

    const expectedWithoutSuffix =
      expected
        .replace(/locators$/, '')
        .replace(/page$/, '')
        .replace(/component$/, '')
        .replace(/flow$/, '');

    if (
      basename.includes(
        expectedWithoutSuffix,
      )
    ) {
      return {
        found: true,
        file: file.path,
        confidence: 0.75,
      };
    }
  }

  return {
    found: false,
    confidence: 0,
  };
}
