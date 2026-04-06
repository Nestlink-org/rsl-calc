export type PowerState = "off" | "booting" | "on";

export interface InputValues {
  annualClaimsSpend: string;
  numClaims: string;
  avgClaimSize: string;
}

export interface SliderValues {
  leakageRate: number; // 0.15–0.25
  detectionRate: number; // 0.40–0.60
  savingsShare: number; // 0.10–0.30
}

export interface CalculatorOutputs {
  estimatedLeakage: number;
  recoverableSavings: number;
  resultShieldShare: number;
}

export const DEFAULT_SLIDERS: SliderValues = {
  leakageRate: 0.2,
  detectionRate: 0.5,
  savingsShare: 0.2,
};

export const EMPTY_INPUTS: InputValues = {
  annualClaimsSpend: "",
  numClaims: "",
  avgClaimSize: "",
};
