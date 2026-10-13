import path from 'node:path';

export interface ProjectPaths {
  root: string;
  source: string;
  tests: string;
  recordings: string;
  models: string;
  plans: string;
  index: string;
}

export function resolveProjectPaths(
  root: string = process.cwd(),
): ProjectPaths {
  return {
    root,
    source: path.join(root, 'src'),
    tests: path.join(root, 'tests'),
    recordings: path.join(root, '.testflow', 'recordings'),
    models: path.join(root, '.testflow', 'models'),
    plans: path.join(root, '.testflow', 'plans'),
    index: path.join(root, '.testflow', 'index'),
  };
}
