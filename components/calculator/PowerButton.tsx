"use client";

import { Power } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PowerState } from "@/lib/types";

interface PowerButtonProps {
  power: PowerState;
  onToggle: () => void;
}

export function PowerButton({ power, onToggle }: PowerButtonProps) {
  const isOn = power === "on";
  const isBooting = power === "booting";

  return (
    <button
      onClick={onToggle}
      disabled={isBooting}
      aria-label={isOn ? "Power off" : "Power on"}
      className={cn(
        // Base shape
        "relative w-12 h-12 rounded-full flex items-center justify-center",
        "transition-all duration-150 select-none",
        // 3D press effect via active pseudo
        "active:scale-[0.92] active:translate-y-0.5",
        // Disabled during boot
        isBooting && "pointer-events-none opacity-60",
        // Off state
        !isOn &&
          !isBooting && [
            "bg-zinc-700 dark:bg-zinc-800",
            "shadow-[0_4px_0_#3f3f46,0_6px_12px_rgba(0,0,0,0.5)]",
            "border border-zinc-600",
            "text-zinc-400 hover:text-zinc-200",
          ],
        // On state
        isOn && [
          "bg-[#67D55E]",
          "shadow-[0_4px_0_#4aad43,0_6px_16px_rgba(103,213,94,0.4)]",
          "border border-[#4aad43]",
          "text-white",
        ],
        // Booting state
        isBooting && [
          "bg-[#67D55E]/60",
          "shadow-[0_4px_0_#4aad43,0_6px_12px_rgba(103,213,94,0.3)]",
          "border border-[#4aad43]/60",
          "text-white/80",
        ],
      )}
    >
      <Power className="w-5 h-5" aria-hidden />
    </button>
  );
}
