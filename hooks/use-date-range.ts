"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { resolveRange } from "@/lib/analytics/ranges";
import type { RangePreset } from "@/lib/analytics/types";

const STORAGE_KEY = "hasvik-range";
const PRESETS: RangePreset[] = ["today", "7d", "30d", "month", "quarter", "custom"];

interface Stored {
  preset: RangePreset;
  from?: string;
  to?: string;
}

function read(): Stored {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Stored | null;
    if (parsed && PRESETS.includes(parsed.preset)) return parsed;
  } catch {
    // Unreadable storage falls back to the default.
  }
  return { preset: "30d" };
}

/** Date range for dashboards and reports. The choice is remembered per browser. */
export function useDateRange(defaultPreset: RangePreset = "30d") {
  const [state, setState] = useState<Stored>({ preset: defaultPreset });
  const [now] = useState(() => new Date());

  useEffect(() => setState(read()), []);

  const choose = useCallback((preset: RangePreset, custom?: { from: string; to: string }) => {
    const next: Stored = { preset, ...(preset === "custom" ? custom : {}) };
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Not remembered, still applied.
    }
  }, []);

  const range = useMemo(
    () => resolveRange(state.preset, now, state.from && state.to ? { from: state.from, to: state.to } : undefined),
    [state, now],
  );
  return { range, preset: state.preset, custom: { from: state.from ?? "", to: state.to ?? "" }, choose };
}
