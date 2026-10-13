import {
  spawnSync,
} from 'node:child_process';

export function runTest(
  args: string[],
): number {
  let environment =
    'local';

  let testTarget:
    string | undefined;

  for (
    let index = 0;
    index < args.length;
    index += 1
  ) {
    const value =
      args[index];

    if (
      value === '--env'
    ) {
      environment =
        args[index + 1] ??
        environment;

      index += 1;
      continue;
    }

    if (
      !value.startsWith(
        '--',
      )
    ) {
      testTarget =
        value;
    }
  }

  const playwrightArgs = [
    'playwright',
    'test',
  ];

  if (testTarget) {
    playwrightArgs.push(
      testTarget,
    );
  } else {
    playwrightArgs.push(
      'tests/e2e',
    );
  }

  const result =
    spawnSync(
      'npx',
      playwrightArgs,
      {
        stdio:
          'inherit',

        env: {
          ...process.env,

          TESTFLOW_ENV:
            environment,
        },
      },
    );

  return (
    result.status ??
    1
  );
}
