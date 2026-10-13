import type {
  ArchitectureProposal,
} from '../agents/architecture-proposal';

export interface ApprovedPlan {
  version: '1.0';

  proposal: ArchitectureProposal;

  approval: {
    approved: true;
    approvedAt: string;
    approvedBy: string;
  };

  repositoryBaseline: {
    gitCommit: string;
    gitTree: string;
    clean: boolean;
  };
}
