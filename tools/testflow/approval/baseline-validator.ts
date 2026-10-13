import type {
  ApprovedPlan,
} from './approved-plan';

import {
  getGitBaseline,
} from './git-baseline';

export interface BaselineValidation {
  valid: boolean;
  errors: string[];
}

export function validateApprovedBaseline(
  approvedPlan: ApprovedPlan,
): BaselineValidation {
  const current =
    getGitBaseline();

  const errors: string[] = [];

  if (!current.clean) {
    errors.push(
      'Repository working tree is not clean.',
    );
  }

  if (
    current.gitCommit !==
    approvedPlan.repositoryBaseline.gitCommit
  ) {
    errors.push(
      'Repository HEAD changed after approval.',
    );
  }

  if (
    current.gitTree !==
    approvedPlan.repositoryBaseline.gitTree
  ) {
    errors.push(
      'Repository tree changed after approval.',
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
}
