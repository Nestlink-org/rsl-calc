"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { calculate } from "@/lib/calculations";
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
  const bootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up boot timer on unmount
  useEffect(() => {
    return () => {
      if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
    };
  }, []);

  function handlePowerToggle() {
    if (power === "off") {
      setPower("booting");
      bootTimerRef.current = setTimeout(() => setPower("on"), 1500);
    } else if (power === "on") {
      setPower("off");
    }
    // booting → ignore (button is disabled)
  }

  function handleInputChange(field: keyof InputValues, raw: string) {
    setInputs((prev) => ({ ...prev, [field]: raw }));
  }

  function handleSliderChange(field: keyof SliderValues, value: number) {
    setSliders((prev) => ({ ...prev, [field]: value }));
  }

  const outputs = useMemo(() => calculate(inputs, sliders), [inputs, sliders]);

  const isOn = power === "on";

  return (
    <div
      className={cn(
        // Outer device body — 3D effect
        "relative w-full max-w-[420px] mx-auto rounded-3xl",
        // Layered box-shadow for 3D depth
        "shadow-[0_2px_0_rgba(255,255,255,0.08)_inset,0_-2px_0_rgba(0,0,0,0.4)_inset,0_20px_60px_rgba(0,0,0,0.6),0_8px_20px_rgba(0,0,0,0.4)]",
        // Glossy border
        "border border-zinc-700/80 dark:border-zinc-600/40",
        // Background — dark plastic feel
        "bg-linear-to-b from-zinc-800 to-zinc-900 dark:from-zinc-900 dark:to-zinc-950",
        // Padding
        "p-4 pb-6",
      )}
    >
      {/* Glossy top highlight */}
      <div className="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent rounded-full" />

      {/* Header bar — brand + LED + theme toggle */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {/* LED indicator */}
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              isOn
                ? "bg-[#67D55E] shadow-[0_0_6px_2px_rgba(103,213,94,0.6)]"
                : "bg-zinc-700 dark:bg-zinc-800",
            )}
            aria-hidden
          />
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 select-none">
            ResultShield Lite™
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Screen */}
      <div className="mb-4">
        <Screen power={power} outputs={outputs} />
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-700/60 dark:border-zinc-800 mb-4" />

      {/* Input + Slider panels — only interactive when on */}
      <div
        className={cn(
          "flex flex-col gap-5 transition-opacity duration-300",
          !isOn && "opacity-40 pointer-events-none select-none",
        )}
      >
        <InputPanel
          values={inputs}
          onChange={handleInputChange}
          disabled={!isOn}
        />
        <div className="border-t border-zinc-700/40 dark:border-zinc-800" />
        <SliderPanel
          values={sliders}
          onChange={handleSliderChange}
          disabled={!isOn}
        />
      </div>

      {/* Bottom bar — power button */}
      <div className="flex justify-center mt-6">
        <PowerButton power={power} onToggle={handlePowerToggle} />
      </div>

      {/* Bottom glossy edge */}
      <div className="absolute inset-x-8 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent rounded-full" />
    </div>
  );
}
