import {
  execFileSync,
} from 'node:child_process';

export interface GitBaseline {
  gitCommit: string;
  gitTree: string;
  clean: boolean;
}

function git(
  args: string[],
): string {
  return execFileSync(
    'git',
    args,
    {
      encoding: 'utf-8',
      stdio: [
        'ignore',
        'pipe',
        'pipe',
      ],
    },
  ).trim();
}

export function getGitBaseline():
  GitBaseline {
  const gitCommit =
    git([
      'rev-parse',
      'HEAD',
    ]);

  const gitTree =
    git([
      'write-tree',
    ]);

  const status =
    git([
      'status',
      '--porcelain',
      '--untracked-files=all',
    ]);

  return {
    gitCommit,
    gitTree,
    clean:
      status.length === 0,
  };
}
