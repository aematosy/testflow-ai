export type ProposedChange =
  | 'REUSE'
  | 'MODIFY'
  | 'CREATE';

export type ProposedArtifactType =
  | 'locator'
  | 'page'
  | 'component'
  | 'flow'
  | 'test';

export interface ArchitectureProposalArtifact {
  change: ProposedChange;

  type: ProposedArtifactType;

  name: string;

  path: string;

  owns: string[];

  reuse?: {
    existingFile?: string;
    existingClass?: string;
    existingMethods?: string[];
  };

  additions?: {
    targets?: string[];
    methods?: string[];
  };

  reason: string;

  confidence: number;
}

export interface ArchitectureProposal {
  version: '1.0';

  recordingId: string;

  repositoryIndexVersion: string;

  generatedBy:
    | 'planner-agent'
    | 'manual';

  artifacts:
    ArchitectureProposalArtifact[];

  forbiddenOperations: [
    'DELETE_EXISTING_FILE',
    'DELETE_EXISTING_METHOD',
    'DELETE_EXISTING_LOCATOR',
    'RENAME_EXISTING_API',
    'REPLACE_EXISTING_FILE'
  ];
}
