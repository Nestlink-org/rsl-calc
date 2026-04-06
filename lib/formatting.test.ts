// Feature: resultshield-lite
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  formatKES,
  formatInputDisplay,
  parseInputValue,
  formatSliderPercent,
  sanitizeNumeric,
} from "./formatting";

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe("formatKES", () => {
  it("formats zero as KES 0", () => expect(formatKES(0)).toBe("KES 0"));
  it("formats 1234567 as KES 1,234,567", () =>
    expect(formatKES(1_234_567)).toBe("KES 1,234,567"));
  it("handles NaN gracefully", () => expect(formatKES(NaN)).toBe("KES 0"));
});

describe("formatInputDisplay", () => {
  it("formats 1000000 as 1,000,000", () =>
    expect(formatInputDisplay("1000000")).toBe("1,000,000"));
  it("returns empty string for empty input", () =>
    expect(formatInputDisplay("")).toBe(""));
  it("returns 0 for zero string", () =>
    expect(formatInputDisplay("0")).toBe("0"));
  it("strips non-numeric characters", () =>
    expect(formatInputDisplay("abc123")).toBe("123"));
});

describe("parseInputValue", () => {
  it("parses comma-formatted string to number", () =>
    expect(parseInputValue("1,000,000")).toBe(1_000_000));
  it("returns 0 for empty string", () => expect(parseInputValue("")).toBe(0));
  it("returns 0 for non-numeric string", () =>
    expect(parseInputValue("abc")).toBe(0));
});

describe("formatSliderPercent", () => {
  it("formats 0.20 as 20%", () => expect(formatSliderPercent(0.2)).toBe("20%"));
  it("formats 0.15 as 15%", () =>
    expect(formatSliderPercent(0.15)).toBe("15%"));
  it("formats 0.30 as 30%", () => expect(formatSliderPercent(0.3)).toBe("30%"));
});

describe("sanitizeNumeric", () => {
  it("removes non-digit characters", () =>
    expect(sanitizeNumeric("abc123def")).toBe("123"));
  it("returns empty string for all non-numeric", () =>
    expect(sanitizeNumeric("abc")).toBe(""));
  it("keeps digits only", () =>
    expect(sanitizeNumeric("1,000,000")).toBe("1000000"));
});

// ─── Property tests ───────────────────────────────────────────────────────────

// Feature: resultshield-lite, Property 7: Input sanitization strips non-numeric characters
it("P7: sanitizeNumeric returns only digit characters", () => {
  fc.assert(
    fc.property(fc.string(), (s) => {
      const result = sanitizeNumeric(s);
      expect(/^[0-9]*$/.test(result)).toBe(true);
    }),
    { numRuns: 100 },
  );
});

// Feature: resultshield-lite, Property 8: KES output formatting
it("P8: formatKES starts with 'KES ' and uses comma separators", () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 999_999_999_999 }), (n) => {
      const result = formatKES(n);
      expect(result.startsWith("KES ")).toBe(true);
      const numeric = result.slice(4);
      // No spaces, only digits and commas
      expect(/^[0-9,]+$/.test(numeric)).toBe(true);
      // Commas appear at correct thousands positions
      expect(Number(numeric.replace(/,/g, ""))).toBe(n);
    }),
    { numRuns: 100 },
  );
});

// Feature: resultshield-lite, Property 9: Slider percentage display formatting
it("P9: formatSliderPercent returns whole number % string", () => {
  fc.assert(
    fc.property(
      fc.float({ min: Math.fround(0.1), max: Math.fround(0.3), noNaN: true }),
      (v) => {
        const result = formatSliderPercent(v);
        expect(result.endsWith("%")).toBe(true);
        const num = Number(result.slice(0, -1));
        expect(Number.isInteger(num)).toBe(true);
      },
    ),
    { numRuns: 100 },
  );
});
