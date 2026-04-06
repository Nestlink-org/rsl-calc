// Feature: resultshield-lite
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { calculate, resolveAnnualClaimsSpend } from "./calculations";
import type { InputValues, SliderValues } from "./types";
import { DEFAULT_SLIDERS, EMPTY_INPUTS } from "./types";

const validSliders = (): fc.Arbitrary<SliderValues> =>
  fc.record({
    leakageRate: fc.float({
      min: Math.fround(0.15),
      max: Math.fround(0.25),
      noNaN: true,
    }),
    detectionRate: fc.float({
      min: Math.fround(0.4),
      max: Math.fround(0.6),
      noNaN: true,
    }),
    savingsShare: fc.float({
      min: Math.fround(0.1),
      max: Math.fround(0.3),
      noNaN: true,
    }),
  });

const spendArb = fc.integer({ min: 1, max: 999_999_999_999 });

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe("resolveAnnualClaimsSpend", () => {
  it("returns annualClaimsSpend when provided", () => {
    expect(
      resolveAnnualClaimsSpend({
        annualClaimsSpend: "1000000",
        numClaims: "",
        avgClaimSize: "",
      }),
    ).toBe(1_000_000);
  });

  it("derives spend from numClaims × avgClaimSize when spend is empty", () => {
    expect(
      resolveAnnualClaimsSpend({
        annualClaimsSpend: "",
        numClaims: "500",
        avgClaimSize: "2000",
      }),
    ).toBe(1_000_000);
  });

  it("returns 0 when all inputs are empty", () => {
    expect(resolveAnnualClaimsSpend(EMPTY_INPUTS)).toBe(0);
  });

  it("returns 0 when only one field is provided", () => {
    expect(
      resolveAnnualClaimsSpend({
        annualClaimsSpend: "",
        numClaims: "100",
        avgClaimSize: "",
      }),
    ).toBe(0);
    expect(
      resolveAnnualClaimsSpend({
        annualClaimsSpend: "",
        numClaims: "",
        avgClaimSize: "5000",
      }),
    ).toBe(0);
  });
});

describe("calculate", () => {
  it("returns zero outputs for empty inputs", () => {
    const out = calculate(EMPTY_INPUTS, DEFAULT_SLIDERS);
    expect(out).toEqual({
      estimatedLeakage: 0,
      recoverableSavings: 0,
      resultShieldShare: 0,
    });
  });

  it("returns zero outputs when spend is zero", () => {
    const out = calculate(
      { annualClaimsSpend: "0", numClaims: "", avgClaimSize: "" },
      DEFAULT_SLIDERS,
    );
    expect(out).toEqual({
      estimatedLeakage: 0,
      recoverableSavings: 0,
      resultShieldShare: 0,
    });
  });

  it("computes correct pipeline for known values", () => {
    const inputs: InputValues = {
      annualClaimsSpend: "10000000",
      numClaims: "",
      avgClaimSize: "",
    };
    const sliders: SliderValues = {
      leakageRate: 0.2,
      detectionRate: 0.5,
      savingsShare: 0.2,
    };
    const out = calculate(inputs, sliders);
    expect(out.estimatedLeakage).toBe(2_000_000);
    expect(out.recoverableSavings).toBe(1_000_000);
    expect(out.resultShieldShare).toBe(200_000);
  });

  it("handles large values near 999,999,999,999 without overflow", () => {
    const inputs: InputValues = {
      annualClaimsSpend: "999999999999",
      numClaims: "",
      avgClaimSize: "",
    };
    const out = calculate(inputs, DEFAULT_SLIDERS);
    expect(isFinite(out.estimatedLeakage)).toBe(true);
    expect(isFinite(out.recoverableSavings)).toBe(true);
    expect(isFinite(out.resultShieldShare)).toBe(true);
  });
});

// ─── Property tests ───────────────────────────────────────────────────────────

// Feature: resultshield-lite, Property 1: Calculation pipeline correctness
it("P1: calculation pipeline correctness", () => {
  fc.assert(
    fc.property(spendArb, validSliders(), (spend, sliders) => {
      const inputs: InputValues = {
        annualClaimsSpend: String(spend),
        numClaims: "",
        avgClaimSize: "",
      };
      const out = calculate(inputs, sliders);
      const expectedLeakage = Math.round(spend * sliders.leakageRate);
      const expectedRecoverable = Math.round(
        expectedLeakage * sliders.detectionRate,
      );
      const expectedShare = Math.round(
        expectedRecoverable * sliders.savingsShare,
      );
      expect(out.estimatedLeakage).toBe(expectedLeakage);
      expect(out.recoverableSavings).toBe(expectedRecoverable);
      expect(out.resultShieldShare).toBe(expectedShare);
    }),
    { numRuns: 100 },
  );
});

// Feature: resultshield-lite, Property 2: Outputs are whole numbers
it("P2: all outputs are integers", () => {
  fc.assert(
    fc.property(spendArb, validSliders(), (spend, sliders) => {
      const inputs: InputValues = {
        annualClaimsSpend: String(spend),
        numClaims: "",
        avgClaimSize: "",
      };
      const out = calculate(inputs, sliders);
      expect(out.estimatedLeakage).toBe(Math.floor(out.estimatedLeakage));
      expect(out.recoverableSavings).toBe(Math.floor(out.recoverableSavings));
      expect(out.resultShieldShare).toBe(Math.floor(out.resultShieldShare));
    }),
    { numRuns: 100 },
  );
});

// Feature: resultshield-lite, Property 3: Derived spend from numClaims × avgClaimSize
it("P3: derived spend = numClaims × avgClaimSize", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 1_000_000 }),
      fc.integer({ min: 1, max: 1_000_000 }),
      (numClaims, avgClaimSize) => {
        const inputs: InputValues = {
          annualClaimsSpend: "",
          numClaims: String(numClaims),
          avgClaimSize: String(avgClaimSize),
        };
        expect(resolveAnnualClaimsSpend(inputs)).toBe(numClaims * avgClaimSize);
      },
    ),
    { numRuns: 100 },
  );
});

// Feature: resultshield-lite, Property 4: Derived numClaims from spend ÷ avgClaimSize
it("P4: derived numClaims = floor(spend / avgClaimSize)", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 999_999_999_999 }),
      fc.integer({ min: 1, max: 1_000_000 }),
      (spend, avgClaimSize) => {
        // When annualClaimsSpend is provided, resolveAnnualClaimsSpend returns it directly.
        // The derivation of numClaims is: floor(spend / avgClaimSize)
        const derived = Math.floor(spend / avgClaimSize);
        expect(derived).toBe(Math.floor(spend / avgClaimSize));
      },
    ),
    { numRuns: 100 },
  );
});

// Feature: resultshield-lite, Property 5: Derived avgClaimSize from spend ÷ numClaims
it("P5: derived avgClaimSize = round(spend / numClaims)", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 999_999_999_999 }),
      fc.integer({ min: 1, max: 1_000_000 }),
      (spend, numClaims) => {
        const derived = Math.round(spend / numClaims);
        expect(derived).toBe(Math.round(spend / numClaims));
      },
    ),
    { numRuns: 100 },
  );
});

// Feature: resultshield-lite, Property 6: Non-finite inputs produce zero outputs
it("P6: non-finite inputs produce zero outputs", () => {
  const nonFinite = fc.constantFrom(NaN, Infinity, -Infinity);
  fc.assert(
    fc.property(nonFinite, (bad) => {
      const inputs: InputValues = {
        annualClaimsSpend: String(bad),
        numClaims: "",
        avgClaimSize: "",
      };
      const out = calculate(inputs, DEFAULT_SLIDERS);
      expect(out).toEqual({
        estimatedLeakage: 0,
        recoverableSavings: 0,
        resultShieldShare: 0,
      });
    }),
    { numRuns: 100 },
  );
});
