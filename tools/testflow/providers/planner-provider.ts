import type {
  PlannerContext,
} from '../agents/planner-context';

import type {
  ArchitectureProposal,
} from '../agents/architecture-proposal';

export interface PlannerProviderRequest {
  context: PlannerContext;
  instructionsPath: string;
  outputPath: string;
}

export interface PlannerProviderResult {
  proposal: ArchitectureProposal;
  provider: string;
}

export interface PlannerProvider {
  readonly name: string;

  plan(
    request: PlannerProviderRequest,
  ): Promise<PlannerProviderResult>;
}
