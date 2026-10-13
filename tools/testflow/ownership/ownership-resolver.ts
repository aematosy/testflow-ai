import type {
  CanonicalStep,
} from '../model/canonical-model';

import type {
  OwnershipDecision,
} from './ownership-model';

function deriveDomainName(
  stepName: string,
): string {
  const segments = stepName
    .split(/[·|>]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    segments.at(-1) ??
    stepName.trim()
  );
}

export function resolveOwnership(
  step: CanonicalStep,
): OwnershipDecision {
  return {
    stepId: step.id,
    stepName: step.name,

    ownership: 'page',

    domainName:
      deriveDomainName(
        step.name,
      ),

    confidence: 0.5,

    reason:
      'Deterministic fallback only. Final ownership must be resolved by the architecture planner.',
  };
}
