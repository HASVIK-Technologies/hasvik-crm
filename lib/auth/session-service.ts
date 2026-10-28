import { markSessionEnded } from "@/lib/auth/sign-out-reason";
import axios from "axios";
import { authTransport } from "@/lib/auth/auth-transport";
import { createSessionController } from "@/lib/auth/session-controller";
import { useAuthStore } from "@/store/auth-store";
import { SessionChangedError } from "@/lib/auth/session-controller";
import { sameSessionIdentity } from "@/lib/auth/session-identity";
import { normalizeAuthUser } from "@/lib/auth/normalize-user";

const logoutKey = "hasvik-crm:signed-out";
export function rememberLogout(value: boolean) {
  try { if (value) sessionStorage.setItem(logoutKey, "1"); else sessionStorage.removeItem(logoutKey); } catch { /* Storage may be unavailable. */ }
}
export function wasLoggedOut() {
  try { return sessionStorage.getItem(logoutKey) === "1"; } catch { return false; }
}

async function requestToken(signal: AbortSignal) {
  const request = async () => {
    const version = useAuthStore.getState().sessionVersion;
    const previous = useAuthStore.getState().user;
    if (signal.aborted) throw new axios.CanceledError();
    const response = await authTransport.post<{ accessToken: string }>("/auth/refresh", undefined, { signal });
    const token = response.data.accessToken;
    if (typeof token !== "string" || !token.trim()) throw new Error("The authentication service returned an invalid token.");
    if (previous) {
      // Shared cookies can change accounts in another tab. Never attach that
      // account's token to the previous user's identity or cached records.
      const verification = await authTransport.get<unknown>("/auth/me", { signal, headers: { Authorization: `Bearer ${token}` } });
      const next = normalizeAuthUser(verification.data);
      if (version !== useAuthStore.getState().sessionVersion || signal.aborted) throw new SessionChangedError();
      if (!sameSessionIdentity(previous, next)) {
        useAuthStore.getState().clearAuth();
        useAuthStore.getState().allowRestore();
        throw new SessionChangedError();
      }
      useAuthStore.getState().setUser(next);
    }
    return token;
  };
  // Serialize cookie rotation across tabs where Web Locks is available.
  return withAuthLock(request, signal);
}

export async function withAuthLock<T>(request: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) return await navigator.locks.request("hasvik-auth-refresh", { signal }, request);
  return request();
}

export const sessionController = createSessionController({
  version: () => useAuthStore.getState().sessionVersion,
  blocked: () => useAuthStore.getState().isLoggingOut || useAuthStore.getState().restoreBlocked,
  request: requestToken,
  apply: (token) => useAuthStore.getState().setToken(token),
  expire: () => {
    markSessionEnded();
    useAuthStore.getState().clearAuth();
  },
  isUnauthorized: (error) => axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0),
});

export const authEventKey = "hasvik-crm:auth-event";
export const authTabId = Math.random().toString(36).slice(2);
export function broadcastAuthChange(type: "logout" | "login") {
  const event = { type, source: authTabId, nonce: Date.now() };
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(authEventKey);
    channel.postMessage(event);
    channel.close();
  }
  try { localStorage.setItem(authEventKey, JSON.stringify(event)); } catch { /* Cross-tab sync is best effort. */ }
}
