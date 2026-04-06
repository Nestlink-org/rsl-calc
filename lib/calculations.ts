import type { InputValues, SliderValues, CalculatorOutputs } from "./types";

function parseRaw(raw: string): number {
  const n = Number(raw.replace(/,/g, "").trim());
  return isFinite(n) && n >= 0 ? n : 0;
}

export function resolveAnnualClaimsSpend(inputs: InputValues): number {
  const spend = inputs.annualClaimsSpend.trim();
  const claims = inputs.numClaims.trim();
  const avg = inputs.avgClaimSize.trim();

  // All three provided — use annualClaimsSpend directly
  if (spend !== "") return parseRaw(spend);

  // Derive from numClaims × avgClaimSize
  if (claims !== "" && avg !== "") {
    const n = parseRaw(claims);
    const a = parseRaw(avg);
    return n * a;
  }

  return 0;
}

export function calculate(
  inputs: InputValues,
  sliders: SliderValues,
): CalculatorOutputs {
  const zero: CalculatorOutputs = {
    estimatedLeakage: 0,
    recoverableSavings: 0,
    resultShieldShare: 0,
  };

  const annualClaimsSpend = resolveAnnualClaimsSpend(inputs);

  if (!isFinite(annualClaimsSpend) || annualClaimsSpend <= 0) return zero;
  if (
    !isFinite(sliders.leakageRate) ||
    !isFinite(sliders.detectionRate) ||
    !isFinite(sliders.savingsShare)
  )
    return zero;

  const estimatedLeakage = Math.round(annualClaimsSpend * sliders.leakageRate);
  const recoverableSavings = Math.round(
    estimatedLeakage * sliders.detectionRate,
  );
  const resultShieldShare = Math.round(
    recoverableSavings * sliders.savingsShare,
  );

  return { estimatedLeakage, recoverableSavings, resultShieldShare };
}
