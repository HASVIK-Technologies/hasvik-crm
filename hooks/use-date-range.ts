"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { resolveRange } from "@/lib/analytics/ranges";
import type { RangePreset } from "@/lib/analytics/types";
import { createLocalStore } from "@/lib/shared/local-store";

const store = createLocalStore("hasvik-range");
const PRESETS: RangePreset[] = ["today", "7d", "30d", "month", "quarter", "custom"];

interface Stored {
  preset: RangePreset;
  from?: string;
  to?: string;
}

function parse(raw: string | null, fallback: RangePreset): Stored {
  try {
    const parsed = JSON.parse(raw ?? "null") as Stored | null;
    if (parsed && PRESETS.includes(parsed.preset)) return parsed;
  } catch {
    // Unreadable value falls back to the default.
  }
  return { preset: fallback };
}

/** Date range for dashboards and reports. The choice is remembered per browser. */
export function useDateRange(defaultPreset: RangePreset = "30d") {
  const raw = useSyncExternalStore(store.subscribe, store.get, store.server);
  const state = useMemo(() => parse(raw, defaultPreset), [raw, defaultPreset]);
  const [now] = useState(() => new Date());

  const choose = useCallback((preset: RangePreset, custom?: { from: string; to: string }) => {
    store.set(JSON.stringify({ preset, ...(preset === "custom" ? custom : {}) }));
  }, []);

  const range = useMemo(
    () => resolveRange(state.preset, now, state.from && state.to ? { from: state.from, to: state.to } : undefined),
    [state, now],
  );
  return { range, preset: state.preset, custom: { from: state.from ?? "", to: state.to ?? "" }, choose };
}
