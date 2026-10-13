export type ChangeType =
  | 'REUSE'
  | 'MODIFY'
  | 'CREATE';

export type ArtifactType =
  | 'locator'
  | 'page'
  | 'component'
  | 'flow'
  | 'test';

export interface PlannedArtifact {
  change: ChangeType;
  type: ArtifactType;
  name: string;
  path: string;
  reason: string;
  confidence: number;
}

export interface ImplementationPlan {
  version: '1.0';

  recordingId: string;

  generatedAt: string;

  policy: {
    destructiveChangesAllowed: false;
    deleteAllowed: false;
    renameAllowed: false;
    replaceAllowed: false;
  };

  artifacts: PlannedArtifact[];

  summary: {
    reuse: number;
    modify: number;
    create: number;
    delete: 0;
  };
}
