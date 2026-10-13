import type {
  ApprovedPlan,
} from '../approval/approved-plan';

import type {
  CanonicalTestFlow,
} from '../model/canonical-model';

export interface GeneratorRequest {
  approvedPlan: ApprovedPlan;
  model: CanonicalTestFlow;
  sandboxRoot: string;
}

export interface GeneratorResult {
  provider: string;
  sandboxRoot: string;
}

export interface GeneratorProvider {
  readonly name: string;

  generate(
    request: GeneratorRequest,
  ): Promise<GeneratorResult>;
}
