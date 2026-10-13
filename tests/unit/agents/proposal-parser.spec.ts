import {
  expect,
  test,
} from '@playwright/test';

import {
  parseArchitectureProposal,
} from '../../../tools/testflow/agents/proposal-parser';

test(
  'parses valid architecture proposal',
  () => {
    const proposal =
      parseArchitectureProposal(
        JSON.stringify({
          version: '1.0',
          recordingId:
            'TF-TEST',
          repositoryIndexVersion:
            '1.0',
          generatedBy:
            'manual',
          artifacts: [],
          forbiddenOperations: [],
        }),
      );

    expect(
      proposal.version,
    ).toBe('1.0');
  },
);

test(
  'rejects non JSON output',
  () => {
    expect(
      () =>
        parseArchitectureProposal(
          'I think we should create a page.',
        ),
    ).toThrow(
      'Planner output is not valid JSON.',
    );
  },
);

test(
  'rejects proposal without artifacts',
  () => {
    expect(
      () =>
        parseArchitectureProposal(
          JSON.stringify({
            version: '1.0',
            recordingId:
              'TF-TEST',
            repositoryIndexVersion:
              '1.0',
            generatedBy:
              'planner-agent',
            forbiddenOperations: [],
          }),
        ),
    ).toThrow(
      'Planner proposal requires artifacts array.',
    );
  },
);
