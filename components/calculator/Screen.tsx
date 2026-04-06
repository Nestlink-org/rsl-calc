"use client";

import { formatKES } from "@/lib/formatting";
import type { PowerState, CalculatorOutputs } from "@/lib/types";

interface ScreenProps {
  power: PowerState;
  outputs: CalculatorOutputs;
}

interface OutputRowProps {
  label: string;
  value: number;
  color: string;
}

function OutputRow({ label, value, color }: OutputRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">
        {label}
      </span>
      <span
        className="text-xl font-bold tabular-nums transition-all duration-300"
        style={{ color }}
      >
        {formatKES(value)}
      </span>
    </div>
  );
}

export function Screen({ power, outputs }: ScreenProps) {
  // OFF — blank dark screen
  if (power === "off") {
    return (
      <div className="w-full rounded-xl bg-zinc-950 dark:bg-black border border-zinc-800 shadow-inner min-h-[220px] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-zinc-800" />
      </div>
    );
  }

  // BOOTING — boot splash
  if (power === "booting") {
    return (
      <div className="w-full rounded-xl bg-zinc-950 dark:bg-black border border-zinc-800 shadow-inner min-h-[220px] flex flex-col items-center justify-center gap-2">
        <span
          className="text-lg font-bold tracking-tight animate-pulse"
          style={{ color: "#67D55E" }}
        >
          ResultShield Lite™
        </span>
        <span className="text-[10px] text-zinc-500 tracking-widest uppercase">
          Initialising…
        </span>
      </div>
    );
  }

  // ON — outputs display
  return (
    <div className="w-full rounded-xl bg-zinc-950 dark:bg-black border border-zinc-800 shadow-inner min-h-[220px] flex flex-col justify-between p-4 gap-3">
      {/* Output rows */}
      <div className="flex flex-col gap-3">
        <OutputRow
          label="Estimated Leakage"
          value={outputs.estimatedLeakage}
          color="#01B3F7"
        />
        <div className="border-t border-zinc-800" />
        <OutputRow
          label="Recoverable Savings"
          value={outputs.recoverableSavings}
          color="#67D55E"
        />
        <div className="border-t border-zinc-800" />
        <OutputRow
          label="ResultShield Share"
          value={outputs.resultShieldShare}
          color="#67D55E"
        />
      </div>

      {/* Tagline */}
      <p className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-600 italic border-t border-zinc-800 pt-3">
        "We're not asking you to believe this — we're asking you to let us prove
        it using your own data."
      </p>
    </div>
  );
}
