import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';

export function loadEnvironment(
  environment: string,
): void {
  const envPath =
    path.resolve(
      'config',
      'environments',
      `${environment}.env`,
    );

  if (!fs.existsSync(envPath)) {
    throw new Error(
      `Environment file not found: ${envPath}`,
    );
  }

  const result =
    dotenv.config({
      path: envPath,
      override: true,
    });

  if (result.error) {
    throw result.error;
  }
}

export function requiredEnvironmentValue(
  name: string,
): string {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}
