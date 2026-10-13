import fs from 'node:fs';

import {
  Project,
  SourceFile,
} from 'ts-morph';

export interface AstPreservationResult {
  valid: boolean;
  errors: string[];
}

interface ClassSnapshot {
  name: string;
  methods: Set<string>;
  properties: Set<string>;
  getters: Set<string>;
  setters: Set<string>;
}

function loadSource(
  filePath: string,
): SourceFile {
  const project =
    new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        allowJs: false,
      },
    });

  const content =
    fs.readFileSync(
      filePath,
      'utf-8',
    );

  return project.createSourceFile(
    'source.ts',
    content,
  );
}

function snapshotClasses(
  filePath: string,
): Map<string, ClassSnapshot> {
  const source =
    loadSource(
      filePath,
    );

  const snapshots =
    new Map<string, ClassSnapshot>();

  for (
    const declaration of source.getClasses()
  ) {
    const name =
      declaration.getName();

    if (!name) {
      continue;
    }

    snapshots.set(
      name,
      {
        name,

        methods:
          new Set(
            declaration
              .getMethods()
              .map(
                (method) =>
                  method.getName(),
              ),
          ),

        properties:
          new Set(
            declaration
              .getProperties()
              .map(
                (property) =>
                  property.getName(),
              ),
          ),

        getters:
          new Set(
            declaration
              .getGetAccessors()
              .map(
                (accessor) =>
                  accessor.getName(),
              ),
          ),

        setters:
          new Set(
            declaration
              .getSetAccessors()
              .map(
                (accessor) =>
                  accessor.getName(),
              ),
          ),
      },
    );
  }

  return snapshots;
}

function checkPreserved(
  kind: string,
  className: string,
  before: Set<string>,
  after: Set<string>,
  errors: string[],
): void {
  for (const member of before) {
    if (!after.has(member)) {
      errors.push(
        `${kind} removed from ${className}: ${member}`,
      );
    }
  }
}

export function validateAstPreservation(
  beforePath: string,
  afterPath: string,
): AstPreservationResult {
  const errors: string[] = [];

  if (
    !fs.existsSync(beforePath)
  ) {
    return {
      valid: false,
      errors: [
        `Original file does not exist: ${beforePath}`,
      ],
    };
  }

  if (
    !fs.existsSync(afterPath)
  ) {
    return {
      valid: false,
      errors: [
        `Generated file deleted existing file: ${beforePath}`,
      ],
    };
  }

  const before =
    snapshotClasses(
      beforePath,
    );

  const after =
    snapshotClasses(
      afterPath,
    );

  for (
    const [
      className,
      original,
    ] of before
  ) {
    const generated =
      after.get(
        className,
      );

    if (!generated) {
      errors.push(
        `Existing class removed: ${className}`,
      );

      continue;
    }

    checkPreserved(
      'Method',
      className,
      original.methods,
      generated.methods,
      errors,
    );

    checkPreserved(
      'Property',
      className,
      original.properties,
      generated.properties,
      errors,
    );

    checkPreserved(
      'Getter',
      className,
      original.getters,
      generated.getters,
      errors,
    );

    checkPreserved(
      'Setter',
      className,
      original.setters,
      generated.setters,
      errors,
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
}
