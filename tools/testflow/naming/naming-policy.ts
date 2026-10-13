import path from 'node:path';

import type {
  ArchitectureProposalArtifact,
} from '../agents/architecture-proposal';

function words(
  value: string,
): string[] {
  return value
    /*
     * XMLParser -> XML Parser
     * PIMEmployee -> PIM Employee
     */
    .replace(
      /([A-Z]+)([A-Z][a-z])/g,
      '$1 $2',
    )

    /*
     * employeeList -> employee List
     */
    .replace(
      /([a-z0-9])([A-Z])/g,
      '$1 $2',
    )

    .replace(
      /[^a-zA-Z0-9]+/g,
      ' ',
    )

    .trim()

    .split(/\s+/)

    .filter(Boolean);
}

function pascalWord(
  word: string,
): string {
  return (
    word.charAt(0).toUpperCase() +
    word.slice(1).toLowerCase()
  );
}

export function toPascalCase(
  value: string,
): string {
  return words(value)
    .map(pascalWord)
    .join('');
}

export function toKebabCase(
  value: string,
): string {
  return words(value)
    .map(
      (word) =>
        word.toLowerCase(),
    )
    .join('-');
}

function stripKnownSuffix(
  name: string,
  type:
    ArchitectureProposalArtifact['type'],
): string {
  const suffixes:
    Record<
      ArchitectureProposalArtifact['type'],
      RegExp
    > = {
      locator:
        /Locators?$/i,

      page:
        /Page$/i,

      component:
        /Component$/i,

      flow:
        /Flow$/i,

      test:
        /(Test|Spec)$/i,
    };

  return name.replace(
    suffixes[type],
    '',
  );
}

export interface CanonicalArtifactName {
  name: string;
  path: string;
}

export function canonicalArtifactName(
  artifact:
    ArchitectureProposalArtifact,
): CanonicalArtifactName {
  const rawBase =
    stripKnownSuffix(
      artifact.name,
      artifact.type,
    );

  const base =
    toPascalCase(
      rawBase,
    );

  const fileBase =
    toKebabCase(
      rawBase,
    );

  switch (artifact.type) {
    case 'locator':
      return {
        name:
          `${base}Locators`,

        path:
          path.posix.join(
            'src/locators',
            `${fileBase}.locators.ts`,
          ),
      };

    case 'page':
      return {
        name:
          `${base}Page`,

        path:
          path.posix.join(
            'src/pages',
            `${fileBase}.page.ts`,
          ),
      };

    case 'component':
      return {
        name:
          `${base}Component`,

        path:
          path.posix.join(
            'src/components',
            `${fileBase}.component.ts`,
          ),
      };

    case 'flow':
      return {
        name:
          `${base}Flow`,

        path:
          path.posix.join(
            'src/flows',
            `${fileBase}.flow.ts`,
          ),
      };

    case 'test':
      return {
        name:
          `${base}Test`,

        path:
          path.posix.join(
            'tests/e2e',
            `${fileBase}.spec.ts`,
          ),
      };
  }
}
