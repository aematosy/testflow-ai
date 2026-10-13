import path from 'node:path';

import {
  Project,
} from 'ts-morph';

import {
  classifyArtifact,
} from './artifact-classifier';

import type {
  RepositoryFile,
  RepositoryKnowledgeModel,
  RepositoryMethod,
} from '../repository/repository-model';

export function indexRepository(
  root: string = process.cwd(),
): RepositoryKnowledgeModel {
  const project = new Project({
    tsConfigFilePath: path.join(
      root,
      'tsconfig.json',
    ),
    skipAddingFilesFromTsConfig: false,
  });

  const files: RepositoryFile[] = [];

  const sourceFiles =
    project.getSourceFiles()
      .filter((sourceFile) => {
        const absolute =
          sourceFile.getFilePath();

        return (
          absolute.includes(
            `${path.sep}src${path.sep}`,
          ) ||
          absolute.includes(
            `${path.sep}tests${path.sep}`,
          )
        );
      });

  for (
    const sourceFile of sourceFiles
  ) {
    const absolute =
      sourceFile.getFilePath();

    const relative =
      path.relative(
        root,
        absolute,
      );

    const type =
      classifyArtifact(absolute);

    const classes =
      sourceFile.getClasses().map(
        (classDeclaration) => {
          const methods: RepositoryMethod[] =
            classDeclaration
              .getMethods()
              .map((method) => ({
                name: method.getName(),
                visibility:
                  method.getScope() ??
                  'public',
                isAsync:
                  method.isAsync(),
                parameters:
                  method
                    .getParameters()
                    .map(
                      (parameter) =>
                        parameter.getName(),
                    ),
              }));

          const imports =
            sourceFile
              .getImportDeclarations()
              .map(
                (declaration) =>
                  declaration
                    .getModuleSpecifierValue(),
              );

          return {
            name:
              classDeclaration.getName() ??
              '<anonymous>',
            file: relative,
            type,
            methods,
            imports,
          };
        },
      );

    files.push({
      path: relative,
      type,
      classes,
    });
  }

  const allClasses =
    files.flatMap(
      (file) => file.classes,
    );

  const methods =
    allClasses.flatMap(
      (artifact) => artifact.methods,
    );

  const countType = (
    type: string,
  ): number =>
    files.filter(
      (file) => file.type === type,
    ).length;

  return {
    version: '1.0',

    generatedAt:
      new Date().toISOString(),

    repository: {
      root,
    },

    statistics: {
      files: files.length,
      classes: allClasses.length,
      methods: methods.length,
      locators:
        countType('locator'),
      pages:
        countType('page'),
      components:
        countType('component'),
      flows:
        countType('flow'),
      tests:
        countType('test'),
    },

    files,
  };
}
