export interface TechnicalSpec {
  label: string;
  value: string;
}

export function parseLines(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|\s*;\s*/)
    .map(item => item.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}

export function parseSpecifications(value?: string | null): TechnicalSpec[] {
  return parseLines(value).map((line, index) => {
    const separator = line.includes(':') ? ':' : line.includes('=') ? '=' : null;
    if (!separator) return { label: `Especificación ${index + 1}`, value: line };
    const [label, ...rest] = line.split(separator);
    return { label: label.trim(), value: rest.join(separator).trim() };
  });
}
