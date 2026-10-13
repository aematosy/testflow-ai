import type {
  CanonicalTestFlow,
} from '../model/canonical-model';

import type {
  RepositoryKnowledgeModel,
} from '../repository/repository-model';

export interface PlannerContext {
  version: '1.0';

  task:
    'PLAN_INCREMENTAL_AUTOMATION';

  constraints: {
    repositoryFirst: true;
    reuseBeforeModifyBeforeCreate: true;
    destructiveChangesForbidden: true;
    locatorsSeparated: true;
  };

  recording:
    CanonicalTestFlow;

  repository:
    RepositoryKnowledgeModel;
}

export function createPlannerContext(
  recording: CanonicalTestFlow,
  repository: RepositoryKnowledgeModel,
): PlannerContext {
  return {
    version: '1.0',

    task:
      'PLAN_INCREMENTAL_AUTOMATION',

    constraints: {
      repositoryFirst: true,
      reuseBeforeModifyBeforeCreate: true,
      destructiveChangesForbidden: true,
      locatorsSeparated: true,
    },

    recording,
    repository,
  };
}
