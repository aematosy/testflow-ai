import type {
  PlannerContext,
} from '../agents/planner-context';

import type {
  ArchitectureProposal,
} from '../agents/architecture-proposal';

import type {
  PlannerProvider,
} from '../providers/planner-provider';

export interface PlannerOrchestratorInput {
  context: PlannerContext;
  instructionsPath: string;
  outputPath: string;
}

export interface PlannerOrchestratorResult {
  proposal: ArchitectureProposal;
  provider: string;
}

export class PlannerOrchestrator {
  constructor(
    private readonly provider:
      PlannerProvider,
  ) {}

  async execute(
    input:
      PlannerOrchestratorInput,
  ): Promise<PlannerOrchestratorResult> {
    return this.provider.plan({
      context:
        input.context,
      instructionsPath:
        input.instructionsPath,
      outputPath:
        input.outputPath,
    });
  }
}
