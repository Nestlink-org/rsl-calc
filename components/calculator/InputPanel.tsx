"use client";

import type { InputValues } from "@/lib/types";
import { sanitizeNumeric, formatInputDisplay } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface InputPanelProps {
  values: InputValues;
  onChange: (field: keyof InputValues, raw: string) => void;
  disabled?: boolean;
  spendLocked?: boolean;
}

interface InputFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (raw: string) => void;
  disabled?: boolean;
}

function InputField({
  label,
  value,
  placeholder,
  onChange,
  disabled,
}: InputFieldProps) {
  const displayValue = value === "" ? "" : formatInputDisplay(value);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase tracking-widest font-bold text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#01B3F7] select-none pointer-events-none">
          KES
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(sanitizeNumeric(e.target.value))}
          onPaste={(e) => {
            e.preventDefault();
            onChange(sanitizeNumeric(e.clipboardData.getData("text")));
          }}
          className={cn(
            "w-full pl-8 pr-2 py-2 rounded-sm text-xs font-mono font-bold",
            "bg-zinc-800 border border-zinc-600",
            "text-white placeholder:text-zinc-600",
            "focus:outline-none focus:ring-1 focus:ring-[#01B3F7] focus:border-[#01B3F7]",
            "transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        />
      </div>
    </div>
  );
}

export function InputPanel({
  values,
  onChange,
  disabled,
  spendLocked,
}: InputPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-200">
        Claim Data
      </span>
      <InputField
        label="Annual Spend"
        value={values.annualClaimsSpend}
        placeholder="50,000,000"
        onChange={(r) => onChange("annualClaimsSpend", r)}
        disabled={disabled}
      />
      <InputField
        label="No. of Claims"
        value={values.numClaims}
        placeholder="12,000"
        onChange={(r) => onChange("numClaims", r)}
        disabled={disabled || spendLocked}
      />
      <InputField
        label="Avg Claim Size"
        value={values.avgClaimSize}
        placeholder="4,200"
        onChange={(r) => onChange("avgClaimSize", r)}
        disabled={disabled || spendLocked}
      />
    </div>
  );
}
