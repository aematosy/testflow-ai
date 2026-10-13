import type {
  ArchitectureProposal,
} from '../agents/architecture-proposal';

import {
  canonicalArtifactName,
} from './naming-policy';

export function normalizeArchitectureProposal(
  proposal:
    ArchitectureProposal,
): ArchitectureProposal {
  return {
    ...proposal,

    artifacts:
      proposal.artifacts.map(
        (artifact) => {
          /*
           * Existing artifacts keep their repository identity.
           *
           * Only CREATE receives canonical naming.
           */
          if (
            artifact.change !==
            'CREATE'
          ) {
            return artifact;
          }

          const canonical =
            canonicalArtifactName(
              artifact,
            );

          return {
            ...artifact,
            name:
              canonical.name,
            path:
              canonical.path,
          };
        },
      ),
  };
}
