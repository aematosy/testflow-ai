import type {
  CanonicalTestFlow,
} from '../../model/canonical-model';

type CanonicalTarget =
  CanonicalTestFlow['targets'][number];

function quote(
  value: string,
): string {
  return JSON.stringify(
    value,
  );
}

export function compileLocatorExpression(
  target: CanonicalTarget,
): string {
  const preferred =
    target.preferredLocator;

  if (!preferred) {
    throw new Error(
      `Target ${target.key} has no preferred locator.`,
    );
  }

  switch (preferred.kind) {
    case 'xpath':
      return (
        `this.page.locator(` +
        quote(
          `xpath=${preferred.value}`,
        ) +
        `)`
      );

    case 'css':
      return (
        `this.page.locator(` +
        quote(
          preferred.value,
        ) +
        `)`
      );

    default:
      throw new Error(
        `Unsupported preferred locator kind ` +
        `${String(preferred.kind)} for ${target.key}.`,
      );
  }
}
