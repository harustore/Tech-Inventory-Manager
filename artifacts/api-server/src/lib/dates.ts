/** Formats a Date (already coerced by zod) as a calendar-only YYYY-MM-DD string for `date` columns. */
export function toDateOnlyString(value: Date): string {
  return value.toISOString().slice(0, 10);
}
