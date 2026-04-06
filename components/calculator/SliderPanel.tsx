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
              <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-300 cursor-help underline decoration-dotted underline-offset-2 select-none">
                {label}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                className="max-w-[180px] rounded-lg px-2.5 py-1.5 text-[10px] leading-relaxed bg-zinc-800 text-zinc-100 shadow-xl border border-zinc-600 z-50"
              >
                {tooltip}
                <Tooltip.Arrow className="fill-zinc-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
        <span className="text-[11px] font-bold tabular-nums" style={{ color }}>
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
        <RadixSlider.Track className="bg-zinc-700 relative grow rounded-full h-1.5">
          <RadixSlider.Range
            className="absolute rounded-full h-full"
            style={{ backgroundColor: color }}
          />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className={cn(
            "block w-3.5 h-3.5 rounded-full bg-white border-2 shadow-md",
            "focus:outline-none hover:scale-110 active:scale-95 transition-transform",
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
    <div className="flex flex-col gap-3">
      <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-200">
        Assumptions
      </span>
      <SliderRow
        label="Leakage Rate"
        tooltip="% of total claims spend estimated to be lost to fraud or leakage."
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
        tooltip="% of leakage that ResultShield can detect and flag for recovery."
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
        tooltip="% of recovered savings directly attributed to ResultShield."
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
