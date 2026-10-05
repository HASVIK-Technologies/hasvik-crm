"use client";

import { useSyncExternalStore } from "react";

// Matches the Tailwind `lg` breakpoint used to switch between the desktop
// form and the mobile stepper. Kept as JS (not CSS-only show/hide) because
// react-hook-form ties each registered field to one specific DOM node -
// mounting both layouts at once would mean two inputs fighting over the
// same field name.
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia(DESKTOP_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

// The server can't know the viewport size, so it assumes mobile; the client
// corrects this immediately after hydration via getSnapshot().
function getServerSnapshot() {
  return false;
}

/**
 * Returns whether the viewport currently matches the desktop breakpoint.
 * Uses useSyncExternalStore (rather than useState + useEffect) since this
 * is exactly what it's for: subscribing a React value to an external
 * browser API (matchMedia) without extra render passes or effect-based
 * setState calls.
 */
export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
