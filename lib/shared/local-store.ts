/** Tiny subscribable wrapper around one localStorage key, for use with useSyncExternalStore. */
export function createLocalStore(key: string) {
  const listeners = new Set<() => void>();
  return {
    subscribe(callback: () => void) {
      listeners.add(callback);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) callback();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(callback);
        window.removeEventListener("storage", onStorage);
      };
    },
    get(): string | null {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(value: string | null) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        // Storage unavailable: the value still applies for this visit through the listeners.
      }
      listeners.forEach((listener) => listener());
    },
    server: (): string | null => null,
  };
}
