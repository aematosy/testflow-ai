export type GeneratedFileOperation =
  | 'CREATE'
  | 'MODIFY';

export interface GeneratedFile {
  operation: GeneratedFileOperation;
  path: string;
  content: string;
}

export interface GenerationManifest {
  version: '1.0';
  recordingId: string;
  files: GeneratedFile[];
}
