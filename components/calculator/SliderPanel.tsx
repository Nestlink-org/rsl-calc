"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { SliderValues } from "@/lib/types";
import { formatSliderPercent } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface SliderPanelProps {
  values: SliderValues;
  onChange: (field: keyof SliderValues, value: number) => void;
  disabled?: boolean;
}

interface SliderRowProps {
  label: string;
  tooltip: string;
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function SliderRow({
  label,
  tooltip,
  value,
  min,
  max,
  step,
  color,
  onChange,
  disabled,
}: SliderRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest font-semibold cursor-help",
                  "text-zinc-500 dark:text-zinc-400 underline decoration-dotted underline-offset-2",
                )}
              >
                {label}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                className={cn(
                  "max-w-[200px] rounded-lg px-3 py-2 text-xs leading-relaxed",
                  "bg-zinc-800 text-zinc-100 shadow-xl border border-zinc-700",
                  "animate-in fade-in-0 zoom-in-95",
                )}
              >
                {tooltip}
                <Tooltip.Arrow className="fill-zinc-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>
          {formatSliderPercent(value)}
        </span>
      </div>

      <RadixSlider.Root
        min={min}
        max={max}
        step={step}
        value={[value]}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
        className="relative flex items-center select-none touch-none w-full h-5"
      >
        <RadixSlider.Track className="bg-zinc-700 dark:bg-zinc-800 relative grow rounded-full h-1.5">
          <RadixSlider.Range
            className="absolute rounded-full h-full"
            style={{ backgroundColor: color }}
          />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className={cn(
            "block w-4 h-4 rounded-full shadow-md",
            "border-2 bg-white",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            "transition-transform hover:scale-110 active:scale-95",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
          style={{ borderColor: color }}
          aria-label={label}
        />
      </RadixSlider.Root>
    </div>
  );
}

export function SliderPanel({ values, onChange, disabled }: SliderPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">
        Assumptions
      </h3>
      <SliderRow
        label="Leakage Rate"
        tooltip="The estimated percentage of total claims spend lost to fraud, errors, or leakage."
        value={values.leakageRate}
        min={0.15}
        max={0.25}
        step={0.01}
        color="#01B3F7"
        onChange={(v) => onChange("leakageRate", v)}
        disabled={disabled}
      />
      <SliderRow
        label="Detection Rate"
        tooltip="The percentage of leakage that ResultShield can detect and flag for recovery."
        value={values.detectionRate}
        min={0.4}
        max={0.6}
        step={0.01}
        color="#01B3F7"
        onChange={(v) => onChange("detectionRate", v)}
        disabled={disabled}
      />
      <SliderRow
        label="Savings Share"
        tooltip="The percentage of recovered savings attributed to ResultShield's intervention."
        value={values.savingsShare}
        min={0.1}
        max={0.3}
        step={0.01}
        color="#67D55E"
        onChange={(v) => onChange("savingsShare", v)}
        disabled={disabled}
      />
    </div>
  );
}
