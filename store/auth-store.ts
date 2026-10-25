"use client";

import { create } from "zustand";
import { tokenExpiresAt } from "@/lib/auth/token-expiry";
import type { AuthUser } from "@/types/auth";

type AuthState = {
  token: string | null;
  tokenExpiresAt: number | null;
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  sessionVersion: number;
  restoreBlocked: boolean;
  isLoggingOut: boolean;
  beginLogin: () => number;
  beginLogout: () => void;
  finishLogout: () => void;
  allowRestore: () => void;
  setSession: (token: string, user: AuthUser) => void;
  setToken: (token: string, expiresAt?: number) => void;
  setUser: (user: AuthUser) => void;
  setStatus: (status: AuthState["status"]) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  tokenExpiresAt: null,
  user: null,
  status: "loading",
  sessionVersion: 0,
  restoreBlocked: false,
  isLoggingOut: false,
  beginLogin: () => {
    set((state) => ({ sessionVersion: state.sessionVersion + 1, token: null, tokenExpiresAt: null, user: null, status: "loading", restoreBlocked: true, isLoggingOut: false }));
    return get().sessionVersion;
  },
  beginLogout: () => set((state) => ({ sessionVersion: state.sessionVersion + 1, token: null, tokenExpiresAt: null, user: null, status: "unauthenticated", restoreBlocked: true, isLoggingOut: true })),
  finishLogout: () => set({ isLoggingOut: false }),
  allowRestore: () => set({ status: "loading", restoreBlocked: false, isLoggingOut: false }),
  setSession: (token, user) => set({ token, tokenExpiresAt: tokenExpiresAt(token), user, status: "authenticated", restoreBlocked: false, isLoggingOut: false }),
  setToken: (token, expiresAt = tokenExpiresAt(token)) =>
    set({ token, tokenExpiresAt: expiresAt }),
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  clearAuth: () =>
    set((state) => ({ sessionVersion: state.sessionVersion + 1, token: null, tokenExpiresAt: null, user: null, status: "unauthenticated", restoreBlocked: true, isLoggingOut: false })),
}));
