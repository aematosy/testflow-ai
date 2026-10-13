export function toPascalCase(
  value: string,
): string {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join('');
}

export function toKebabCase(
  value: string,
): string {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}
