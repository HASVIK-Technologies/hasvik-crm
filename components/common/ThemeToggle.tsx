"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme, type ThemePreference } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export const THEME_OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Segmented Light / Dark / System control. */
export default function ThemeToggle({ className }: { className?: string }) {
  const { preference, choose } = useTheme();
  return (
    <div role="radiogroup" aria-label="Colour theme" className={cn("inline-flex gap-1 rounded-xl bg-surface-2 p-1 ring-1 ring-line ring-inset", className)}>
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={preference === value}
          onClick={() => choose(value)}
          className={cn(
            "inline-flex h-10 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-all",
            preference === value ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink",
          )}
        >
          <Icon className="size-4" aria-hidden />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
