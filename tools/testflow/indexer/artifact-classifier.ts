import type {
  RepositoryArtifactType,
} from '../repository/repository-model';

export function classifyArtifact(
  filePath: string,
): RepositoryArtifactType {
  const normalized =
    filePath.replaceAll('\\', '/');

  if (
    normalized.includes('/src/locators/')
  ) {
    return 'locator';
  }

  if (
    normalized.includes('/src/pages/')
  ) {
    return 'page';
  }

  if (
    normalized.includes('/src/components/')
  ) {
    return 'component';
  }

  if (
    normalized.includes('/src/flows/')
  ) {
    return 'flow';
  }

  if (
    normalized.includes('/src/models/')
  ) {
    return 'model';
  }

  if (
    normalized.includes('/src/data/factories/')
  ) {
    return 'factory';
  }

  if (
    normalized.includes('/tests/')
  ) {
    return 'test';
  }

  return 'other';
}
