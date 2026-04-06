/** Format a number as KES output: "KES 1,234,567" */
export function formatKES(value: number): string {
  if (!isFinite(value)) return "KES 0";
  return "KES " + Math.round(value).toLocaleString("en-US");
}

/** Strip non-numeric chars from a raw string, keeping only digits */
export function sanitizeNumeric(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

/** Strip non-numeric chars and keep only digits (no decimals) for integers */
export function sanitizeInteger(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

/** Display a raw numeric string with comma separators, e.g. "1000000" → "1,000,000" */
export function formatInputDisplay(raw: string): string {
  const digits = sanitizeNumeric(raw);
  if (digits === "" || digits === "0") return digits;
  return Number(digits).toLocaleString("en-US");
}

/** Parse a display value (possibly comma-formatted) back to a number */
export function parseInputValue(formatted: string): number {
  const stripped = formatted.replace(/,/g, "").trim();
  const n = Number(stripped);
  return isFinite(n) && n >= 0 ? n : 0;
}

/** Format a decimal slider value as a percentage string: 0.20 → "20%" */
export function formatSliderPercent(value: number): string {
  return Math.round(value * 100) + "%";
}
