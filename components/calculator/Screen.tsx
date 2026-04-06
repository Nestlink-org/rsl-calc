"use client";

import Image from "next/image";
import type { PowerState, CalculatorOutputs } from "@/lib/types";

interface ScreenProps {
  power: PowerState;
  outputs: CalculatorOutputs;
  shuttingDown?: boolean;
}

interface OutputBlockProps {
  label: string;
  value: number;
  color: string;
}

function OutputBlock({ label, value, color }: OutputBlockProps) {
  const formatted = new Intl.NumberFormat("en-US").format(value);
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2.5">
      <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-500">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[11px] font-bold text-zinc-400">KES</span>
        <span
          className="text-[22px] font-bold tabular-nums leading-tight tracking-tight transition-all duration-300"
          style={{ color }}
        >
          {formatted}
        </span>
      </div>
    </div>
  );
}

function BootScreen({ shuttingDown }: { shuttingDown: boolean }) {
  return (
    <div className="w-full rounded-xl bg-zinc-950 border border-zinc-800 h-[160px] flex flex-col items-center justify-center gap-3 shadow-inner">
      {/* Logo + brand name side by side */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="ResultShield Lite™"
          width={32}
          height={32}
          className="object-contain"
          priority
        />
        <span className="text-lg font-bold tracking-tight bg-linear-to-r from-[#67d55e] to-[#01b3f7] text-transparent bg-clip-text ">
          ResultShield Lite™
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
        {shuttingDown ? "Powering off…" : "Initialising…"}
      </span>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: shuttingDown ? "#ef4444" : "#67D55E",
              animationDelay: `${i * 200}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function Screen({ power, outputs, shuttingDown = false }: ScreenProps) {
  if (power === "off") {
    return (
      <div className="w-full rounded-xl bg-zinc-950 border border-zinc-800 h-[160px] flex items-center justify-center shadow-inner">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (power === "booting") {
    return <BootScreen shuttingDown={shuttingDown} />;
  }

  return (
    <div className="w-full rounded-xl bg-zinc-950 border border-zinc-800 shadow-inner overflow-hidden">
      <OutputBlock
        label="Estimated Leakage"
        value={outputs.estimatedLeakage}
        color="#01B3F7"
      />
      <div className="border-t border-dashed border-zinc-700/80 mx-4" />
      <OutputBlock
        label="Recoverable Savings"
        value={outputs.recoverableSavings}
        color="#67D55E"
      />
      <div className="border-t border-dashed border-zinc-700/80 mx-4" />
      <OutputBlock
        label="ResultShield Share"
        value={outputs.resultShieldShare}
        color="#67D55E"
      />
      <div className="border-t border-dashed border-zinc-700/80 mx-4" />
      <p className="px-4 py-2 max-sm:text-[9px] text-sm leading-relaxed text-zinc-600 italic">
        "We're not asking you to believe this we're asking you to let us prove
        it using your own data."
      </p>
    </div>
  );
}
