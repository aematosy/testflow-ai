import path from 'node:path';

import {
  expect,
  test,
} from '@playwright/test';

import {
  MockPlannerProvider,
} from '../../../tools/testflow/providers/mock-planner.provider';

import {
  PlannerOrchestrator,
} from '../../../tools/testflow/planner/planner-orchestrator';

import type {
  PlannerContext,
} from '../../../tools/testflow/agents/planner-context';

const context =
  {
    version: '1.0',
    task:
      'PLAN_INCREMENTAL_AUTOMATION',
    constraints: {
      repositoryFirst: true,
      reuseBeforeModifyBeforeCreate:
        true,
      destructiveChangesForbidden:
        true,
      locatorsSeparated:
        true,
    },
    recording: {
      modelVersion: '1.0',
      recording: {
        schemaVersion: '2.1',
        sessionId: 'TEST',
        sessionName: 'Test',
        generatedAt:
          '2026-01-01T00:00:00.000Z',
      },
      application: {
        origin:
          'https://example.test',
      },
      steps: [],
      targets: [],
      statistics: {
        steps: 0,
        actions: 0,
        assertions: 0,
        sensitiveActions: 0,
        skippedActions: 0,
        uniqueTargets: 0,
      },
    },
    repository: {
      version: '1.0',
      generatedAt:
        '2026-01-01T00:00:00.000Z',
      repository: {
        root: '/test',
      },
      statistics: {
        files: 0,
        classes: 0,
        methods: 0,
        locators: 0,
        pages: 0,
        components: 0,
        flows: 0,
        tests: 0,
      },
      files: [],
    },
  } satisfies PlannerContext;

test(
  'planner orchestrator is provider agnostic',
  async () => {
    const provider =
      new MockPlannerProvider(
        path.resolve(
          'tests/fixtures/valid-proposal.json',
        ),
      );

    const orchestrator =
      new PlannerOrchestrator(
        provider,
      );

    const result =
      await orchestrator.execute({
        context,
        instructionsPath:
          '.github/agents/testflow-planner.agent.md',
        outputPath:
          '/tmp/proposal.json',
      });

    expect(
      result.provider,
    ).toBe('mock');

    expect(
      result.proposal.artifacts,
    ).toHaveLength(1);

    expect(
      result.proposal.artifacts[0]
        .name,
    ).toBe(
      'LoginLocators',
    );
  },
);
