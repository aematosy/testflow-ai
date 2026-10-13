import type {
  ArchitectureProposal,
} from '../agents/architecture-proposal';

import type {
  CanonicalTestFlow,
} from '../model/canonical-model';

export interface LocatorOwnershipValidation {
  valid: boolean;
  errors: string[];
}

export function validateLocatorOwnership(
  proposal: ArchitectureProposal,
  model: CanonicalTestFlow,
): LocatorOwnershipValidation {
  const errors: string[] = [];

  const validTargetKeys =
    new Set(
      model.targets.map(
        (target) => target.key,
      ),
    );

  const owners =
    new Map<string, string[]>();

  const locatorArtifacts =
    proposal.artifacts.filter(
      (artifact) =>
        artifact.type === 'locator',
    );

  for (const artifact of locatorArtifacts) {
    for (const targetKey of artifact.owns) {
      if (!validTargetKeys.has(targetKey)) {
        errors.push(
          `${artifact.name}: invalid locator target key ` +
          `${JSON.stringify(targetKey)}.`,
        );

        continue;
      }

      const current =
        owners.get(targetKey) ?? [];

      current.push(artifact.name);

      owners.set(
        targetKey,
        current,
      );
    }
  }

  for (const target of model.targets) {
    const targetOwners =
      owners.get(target.key) ?? [];

    if (targetOwners.length === 0) {
      errors.push(
        `Target ${target.key} has no locator owner.`,
      );
    }

    if (targetOwners.length > 1) {
      errors.push(
        `Target ${target.key} has multiple locator owners: ` +
        `${targetOwners.join(', ')}.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
