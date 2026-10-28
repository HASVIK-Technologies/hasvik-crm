"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/shared/local-store";

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "hasvik-theme";
const store = createLocalStore(THEME_STORAGE_KEY);

function toPreference(value: string | null): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

function applyTheme(preference: ThemePreference) {
  const dark = preference === "dark" || (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

/** Light / Dark / System, remembered per browser. The first paint is handled by the inline script in app/layout.tsx. */
export function useTheme() {
  const stored = useSyncExternalStore(store.subscribe, store.get, store.server);
  const preference = toPreference(stored);

  useEffect(() => {
    applyTheme(preference);
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const choose = useCallback((next: ThemePreference) => store.set(next === "system" ? null : next), []);
  return { preference, choose };
}
