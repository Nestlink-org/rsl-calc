"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render icon after mount
  useEffect(() => setMounted(true), []);

  function toggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <button
      aria-label="Toggle light/dark mode"
      onClick={toggle}
      className={cn(
        "rounded-full p-1.5 transition-colors",
        "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100",
        "hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60",
        className,
      )}
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4" aria-hidden />
        ) : (
          <Moon className="h-4 w-4" aria-hidden />
        )
      ) : (
        // Placeholder to avoid layout shift before mount
        <span className="h-4 w-4 block" />
      )}
    </button>
  );
}
