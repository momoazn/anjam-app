export const MAX_TITLE = 200;
export const MAX_TEXT = 10000;
export const MAX_NAME = 100;
export const MAX_SEARCH = 200;

/** Trims a required text field and enforces non-empty and a max length. */
export function cleanText(value: string, field: string, max: number): string {
  const text = value.trim();
  if (!text) throw new Error(`${field} is required`);
  if (text.length > max) throw new Error(`${field} is too long`);
  return text;
}

/** Like cleanText, but an empty result means "no value" (undefined). */
export function cleanOptionalText(
  value: string,
  field: string,
  max: number,
): string | undefined {
  const text = value.trim();
  if (text.length > max) throw new Error(`${field} is too long`);
  return text || undefined;
}

/** Rejects NaN, Infinity and negative numbers. */
export function assertNonNegative(value: number | undefined, field: string) {
  if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
    throw new Error(`${field} must be a non-negative number`);
  }
}

export function capSearch(value: string): string {
  return value.trim().slice(0, MAX_SEARCH);
}
