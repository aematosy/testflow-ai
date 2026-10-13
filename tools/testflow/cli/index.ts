#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { runApprove } from './commands/approve.command';
import { runDoctor } from './commands/doctor.command';
import { runImport } from './commands/import.command';
import { runInspect } from './commands/inspect.command';
import { runIndex } from './commands/index.command';
import { runPlan } from './commands/plan.command';
import { runPlanAgent } from './commands/plan-agent.command';
import { runPreparePlan } from './commands/prepare-plan.command';
import { runValidate } from './commands/validate.command';
import { runValidatePlan } from './commands/validate-plan.command';
import { printHelp } from './help';

function getVersion(): string {
  const packagePath = path.join(
    process.cwd(),
    'package.json',
  );

  const raw = fs.readFileSync(
    packagePath,
    'utf-8',
  );

  const packageJson = JSON.parse(raw) as {
    version?: string;
  };

  return packageJson.version ?? '0.0.0';
}

async function main(): Promise<void> {
  const [, , command] = process.argv;

  if (
    !command ||
    command === '--help' ||
    command === '-h'
  ) {
    printHelp();
    return;
  }

  if (
    command === '--version' ||
    command === '-v'
  ) {
    console.log(getVersion());
    return;
  }

  if (command === 'doctor') {
    process.exitCode = runDoctor();
    return;
  }

  if (command === 'approve') {
    process.exitCode = runApprove(
      process.argv[3],
    );
    return;
  }

  if (command === 'import') {
    process.exitCode = runImport(
      process.argv[3],
    );
    return;
  }

  if (command === 'validate') {
    process.exitCode = runValidate(
      process.argv[3],
    );
    return;
  }

  if (command === 'inspect') {
    process.exitCode = runInspect(
      process.argv[3],
    );
    return;
  }

  if (command === 'index') {
    process.exitCode = runIndex();
    return;
  }

  if (command === 'plan') {
    process.exitCode = runPlan(
      process.argv[3],
    );
    return;
  }

  if (command === 'plan-agent') {
    process.exitCode = await runPlanAgent(
      process.argv[3],
    );
    return;
  }

  if (command === 'prepare-plan') {
    process.exitCode = runPreparePlan(
      process.argv[3],
    );
    return;
  }

  if (command === 'validate-plan') {
    process.exitCode = runValidatePlan(
      process.argv[3],
    );
    return;
  }

  console.error(
    `\nUnknown command: ${command}\n`,
  );

  printHelp();
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  console.error(
    `\nTestFlow CLI failed: ${message}\n`,
  );

  process.exitCode = 1;
});
