import path from 'node:path';

import {
  indexRepository,
} from '../../indexer/repository-indexer';

import {
  storeRepositoryIndex,
} from '../../indexer/index-store';

export function runIndex(): number {
  try {
    const model =
      indexRepository();

    const destination =
      storeRepositoryIndex(
        model,
      );

    console.log(
      '\nTestFlow Repository Index',
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      `Files               ${model.statistics.files}`,
    );

    console.log(
      `Classes             ${model.statistics.classes}`,
    );

    console.log(
      `Methods             ${model.statistics.methods}`,
    );

    console.log(
      `Locator files       ${model.statistics.locators}`,
    );

    console.log(
      `Pages               ${model.statistics.pages}`,
    );

    console.log(
      `Components          ${model.statistics.components}`,
    );

    console.log(
      `Flows               ${model.statistics.flows}`,
    );

    console.log(
      `Tests               ${model.statistics.tests}`,
    );

    console.log(
      '\nArtifacts',
    );

    for (const file of model.files) {
      if (
        file.type === 'other'
      ) {
        continue;
      }

      console.log(
        `\n  [${file.type.toUpperCase()}] ${file.path}`,
      );

      for (
        const artifact of file.classes
      ) {
        console.log(
          `    ${artifact.name}`,
        );

        for (
          const method of artifact.methods
        ) {
          console.log(
            `      - ${method.name}()`,
          );
        }
      }
    }

    console.log(
      '\nRepository model',
    );

    console.log(
      `  ${path.relative(
        process.cwd(),
        destination,
      )}`,
    );

    console.log(
      '════════════════════════════════════════',
    );

    console.log(
      '\nRepository indexed successfully.\n',
    );

    return 0;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `\nRepository indexing failed: ${message}\n`,
    );

    return 1;
  }
}
