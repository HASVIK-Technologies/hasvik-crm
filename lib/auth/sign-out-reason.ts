// Remembers, for this tab, that the session ended on its own (expired, or the account signed in on another device,
// which the API allows only once at a time) so the sign-in screen can explain it instead of silently reappearing.
const KEY = "hasvik-crm:signed-out-reason";
const listeners = new Set<() => void>();

export function markSessionEnded() {
  try {
    sessionStorage.setItem(KEY, "expired");
  } catch {
    // Storage unavailable: the sign-in screen just shows no notice.
  }
  listeners.forEach((listener) => listener());
}

export function clearSessionEnded() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  listeners.forEach((listener) => listener());
}

export const sessionEndedStore = {
  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  get(): boolean {
    try {
      return sessionStorage.getItem(KEY) === "expired";
    } catch {
      return false;
    }
  },
  server: () => false,
};
