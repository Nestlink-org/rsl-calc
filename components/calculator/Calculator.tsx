"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { calculate, resolveAnnualClaimsSpend } from "@/lib/calculations";
import { DEFAULT_SLIDERS, EMPTY_INPUTS } from "@/lib/types";
import type { PowerState, InputValues, SliderValues } from "@/lib/types";
import { Screen } from "./Screen";
import { InputPanel } from "./InputPanel";
import { SliderPanel } from "./SliderPanel";
import { PowerButton } from "./PowerButton";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

export function Calculator() {
  const [power, setPower] = useState<PowerState>("off");
  const [inputs, setInputs] = useState<InputValues>(EMPTY_INPUTS);
  const [sliders, setSliders] = useState<SliderValues>(DEFAULT_SLIDERS);
  const [shuttingDown, setShuttingDown] = useState(false);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
    };
  }, []);

  function handlePowerToggle() {
    if (power === "off") {
      setShuttingDown(false);
      setPower("booting");
      bootTimerRef.current = setTimeout(() => setPower("on"), 1500);
    } else if (power === "on") {
      setShuttingDown(true);
      setPower("booting");
      bootTimerRef.current = setTimeout(() => {
        setPower("off");
        setShuttingDown(false);
      }, 2000);
    }
  }

  function handleClear() {
    setInputs(EMPTY_INPUTS);
    setSliders(DEFAULT_SLIDERS);
  }

  function handleCalc() {
    if (!inputs.annualClaimsSpend && inputs.numClaims && inputs.avgClaimSize) {
      const derived = resolveAnnualClaimsSpend(inputs);
      setInputs((p) => ({ ...p, annualClaimsSpend: String(derived) }));
    }
  }

  const isOn = power === "on";
  const outputs = useMemo(() => calculate(inputs, sliders), [inputs, sliders]);

  const canCalc =
    isOn &&
    inputs.annualClaimsSpend.trim() === "" &&
    inputs.numClaims.trim() !== "" &&
    inputs.avgClaimSize.trim() !== "";

  const spendLocked = inputs.annualClaimsSpend.trim() !== "";

  return (
    <div
      className={cn(
        "relative w-full max-w-[520px] mx-auto rounded-[28px]",
        "shadow-[0_2px_0_rgba(255,255,255,0.07)_inset,0_-3px_0_rgba(0,0,0,0.6)_inset,0_24px_64px_rgba(0,0,0,0.7),0_8px_24px_rgba(0,0,0,0.5)]",
        "border border-zinc-600/60 bg-[#232326] p-4",
      )}
    >
      {/* Top gloss */}
      <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* LED */}
          <div
            className={cn(
              "w-2 h-2 rounded-full shrink-0 transition-all duration-500",
              isOn
                ? "bg-[#67D55E] shadow-[0_0_8px_3px_rgba(103,213,94,0.55)]"
                : "bg-zinc-700",
            )}
            aria-hidden
          />
          {/* Real logo — icon size */}
          <Image
            src="/logo.png"
            alt="ResultShield Lite™"
            width={24}
            height={24}
            className="object-contain"
            priority
          />
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase  select-none bg-linear-to-r from-[#67d55e] to-[#01b3f7] text-transparent bg-clip-text ">
            ResultShield Lite™
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* ── Screen ── */}
      <div className="mb-3">
        <Screen power={power} outputs={outputs} shuttingDown={shuttingDown} />
      </div>

      {/* ── Separator ── */}
      <div className="border-t border-zinc-700 mb-3" />

      {/* ── Button bar ── */}
      <div className="flex items-center justify-between gap-3">
        {/* CLR */}
        <button
          onClick={handleClear}
          disabled={!isOn}
          aria-label="Clear all inputs"
          className={cn(
            "w-16 h-10 rounded-xl flex items-center justify-center",
            "text-[11px] font-bold tracking-widest uppercase",
            "transition-all duration-150 select-none",
            "active:scale-95 active:translate-y-0.5",
            isOn
              ? "bg-zinc-700 border border-zinc-600 text-zinc-200 shadow-[0_3px_0_#3f3f46,0_4px_10px_rgba(0,0,0,0.4)] hover:bg-zinc-600 hover:text-white cursor-pointer"
              : "bg-zinc-800 border border-zinc-700 text-zinc-600 cursor-not-allowed shadow-none",
          )}
        >
          CLR
        </button>

        {/* POWER */}
        <PowerButton power={power} onToggle={handlePowerToggle} />

        {/* CALC */}
        <button
          onClick={handleCalc}
          disabled={!canCalc}
          aria-label="Calculate from claims and average"
          className={cn(
            "w-16 h-10 rounded-xl flex items-center justify-center",
            "text-[11px] font-bold tracking-widest uppercase",
            "transition-all duration-150 select-none",
            "active:scale-95 active:translate-y-0.5",
            canCalc
              ? "bg-[#01B3F7] border border-[#0099d4] text-white shadow-[0_3px_0_#0099d4,0_4px_12px_rgba(1,179,247,0.35)] hover:bg-[#00a8eb] cursor-pointer"
              : "bg-zinc-800 border border-zinc-700 text-zinc-600 cursor-not-allowed shadow-none",
          )}
        >
          CALC
        </button>
      </div>

      {/* ── Side-by-side: Inputs | Sliders ── */}
      <div
        className={cn(
          "grid grid-cols-2 gap-0 transition-opacity duration-300 mt-3",
          !isOn && "opacity-30 pointer-events-none select-none",
        )}
      >
        <div className="pr-3">
          <InputPanel
            values={inputs}
            onChange={(f, r) => setInputs((p) => ({ ...p, [f]: r }))}
            disabled={!isOn}
            spendLocked={spendLocked}
          />
        </div>
        <div className="border-l border-zinc-700 pl-3">
          <SliderPanel
            values={sliders}
            onChange={(f, v) => setSliders((p) => ({ ...p, [f]: v }))}
            disabled={!isOn}
          />
        </div>
      </div>

      {/* Bottom gloss */}
      <div className="absolute inset-x-12 bottom-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
    </div>
  );
}
