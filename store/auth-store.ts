"use client";

import { create } from "zustand";
import { ACCESS_TOKEN_TTL_MS } from "@/lib/auth-config";
import type { AuthUser } from "@/types/auth";

type AuthState = {
  token: string | null;
  tokenExpiresAt: number | null;
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setToken: (token: string, expiresAt?: number) => void;
  setUser: (user: AuthUser) => void;
  setStatus: (status: AuthState["status"]) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  tokenExpiresAt: null,
  user: null,
  status: "unauthenticated",
  setToken: (token, expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS) =>
    set({ token, tokenExpiresAt: expiresAt, status: "authenticated" }),
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  clearAuth: () =>
    set({ token: null, tokenExpiresAt: null, user: null, status: "unauthenticated" }),
}));
