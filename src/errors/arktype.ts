export function formatActualValue(value: unknown): string {
  if (value === undefined || value === null) return "";

  const str = String(value);
  if (str.startsWith('"') && str.endsWith('"') && str.length > 1) {
    return str.slice(1, -1);
  }

  return str;
}
