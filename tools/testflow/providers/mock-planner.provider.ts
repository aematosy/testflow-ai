import fs from 'node:fs';

import type {
  PlannerProvider,
  PlannerProviderRequest,
  PlannerProviderResult,
} from './planner-provider';

import {
  parseArchitectureProposal,
} from '../agents/proposal-parser';

export class MockPlannerProvider
implements PlannerProvider {
  readonly name =
    'mock';

  constructor(
    private readonly fixturePath:
      string,
  ) {}

  async plan(
    _request:
      PlannerProviderRequest,
  ): Promise<PlannerProviderResult> {
    const raw =
      fs.readFileSync(
        this.fixturePath,
        'utf-8',
      );

    return {
      proposal:
        parseArchitectureProposal(
          raw,
        ),
      provider:
        this.name,
    };
  }
}
