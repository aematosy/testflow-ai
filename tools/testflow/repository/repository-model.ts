export type RepositoryArtifactType =
  | 'locator'
  | 'page'
  | 'component'
  | 'flow'
  | 'model'
  | 'factory'
  | 'test'
  | 'other';

export interface RepositoryMethod {
  name: string;
  visibility: string;
  isAsync: boolean;
  parameters: string[];
}

export interface RepositoryClass {
  name: string;
  file: string;
  type: RepositoryArtifactType;
  methods: RepositoryMethod[];
  imports: string[];
}

export interface RepositoryFile {
  path: string;
  type: RepositoryArtifactType;
  classes: RepositoryClass[];
}

export interface RepositoryKnowledgeModel {
  version: '1.0';
  generatedAt: string;

  repository: {
    root: string;
  };

  statistics: {
    files: number;
    classes: number;
    methods: number;
    locators: number;
    pages: number;
    components: number;
    flows: number;
    tests: number;
  };

  files: RepositoryFile[];
}
