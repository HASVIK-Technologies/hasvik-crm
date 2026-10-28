"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "hasvik-theme";

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function applyTheme(preference: ThemePreference) {
  const dark = preference === "dark" || (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

/** Light / Dark / System, remembered per browser. The first paint is handled by the inline script in app/layout.tsx. */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    setPreference(readPreference());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if (readPreference() === "system") applyTheme("system"); };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const choose = useCallback((next: ThemePreference) => {
    setPreference(next);
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice still applies for this visit.
    }
    applyTheme(next);
  }, []);

  return { preference, choose };
}
