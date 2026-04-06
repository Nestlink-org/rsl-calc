"use client";

import type { InputValues } from "@/lib/types";
import { sanitizeNumeric, formatInputDisplay } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface InputPanelProps {
  values: InputValues;
  onChange: (field: keyof InputValues, raw: string) => void;
  disabled?: boolean;
}

interface InputFieldProps {
  label: string;
  value: string;
  placeholder: string;
  integerOnly?: boolean;
  onChange: (raw: string) => void;
  disabled?: boolean;
}

function InputField({
  label,
  value,
  placeholder,
  integerOnly = false,
  onChange,
  disabled,
}: InputFieldProps) {
  const displayValue = value === "" ? "" : formatInputDisplay(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = sanitizeNumeric(e.target.value);
    onChange(raw);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const raw = sanitizeNumeric(pasted);
    onChange(raw);
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#01B3F7] select-none">
          KES
        </span>
        <input
          type="text"
          inputMode={integerOnly ? "numeric" : "decimal"}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          onPaste={handlePaste}
          className={cn(
            "w-full pl-10 pr-3 py-2.5 rounded-lg text-sm font-mono font-semibold",
            "bg-zinc-900 dark:bg-zinc-950 border border-zinc-700 dark:border-zinc-800",
            "text-zinc-100 placeholder:text-zinc-600",
            "focus:outline-none focus:ring-2 focus:ring-[#01B3F7]/50 focus:border-[#01B3F7]",
            "transition-colors duration-150",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        />
      </div>
    </div>
  );
}

export function InputPanel({ values, onChange, disabled }: InputPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">
        Claim Data
      </h3>
      <InputField
        label="Annual Claims Spend"
        value={values.annualClaimsSpend}
        placeholder="e.g. 50,000,000"
        onChange={(raw) => onChange("annualClaimsSpend", raw)}
        disabled={disabled}
      />
      <InputField
        label="Number of Claims / Year"
        value={values.numClaims}
        placeholder="e.g. 12,000"
        integerOnly
        onChange={(raw) => onChange("numClaims", raw)}
        disabled={disabled}
      />
      <InputField
        label="Average Claim Size"
        value={values.avgClaimSize}
        placeholder="e.g. 4,200"
        onChange={(raw) => onChange("avgClaimSize", raw)}
        disabled={disabled}
      />
    </div>
  );
}
