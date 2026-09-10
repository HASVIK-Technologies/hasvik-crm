"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  setToken: (token: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearAuth: () => set({ token: null }),
    }),
    {
      name: "hasvik-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
