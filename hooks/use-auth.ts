"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  ACCESS_TOKEN_REFRESH_BUFFER_MS,
} from "@/lib/auth-config";
import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
} from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth-store";
import type { AuthSession } from "@/types/auth";

export const authQueryKeys = {
  session: ["auth", "session"] as const,
  user: ["auth", "user"] as const,
};

export function useTokenRefresh() {
  const token = useAuthStore((state) => state.token);
  const tokenExpiresAt = useAuthStore((state) => state.tokenExpiresAt);
  const setToken = useAuthStore((state) => state.setToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!token || !tokenExpiresAt) return;

    const refreshIn = Math.max(
      tokenExpiresAt - Date.now() - ACCESS_TOKEN_REFRESH_BUFFER_MS,
      1000,
    );
    const timeoutId = window.setTimeout(async () => {
      try {
        const accessToken = await refreshAccessToken();
        setToken(accessToken);
      } catch {
        clearAuth();
      }
    }, refreshIn);

    return () => window.clearTimeout(timeoutId);
  }, [clearAuth, setToken, token, tokenExpiresAt]);
}

export function useAuthSession(enabled = true) {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: authQueryKeys.session,
    enabled,
    retry: false,
    queryFn: async (): Promise<AuthSession> => {
      const accessToken = token ?? (await refreshAccessToken());
      setToken(accessToken);
      const user = await getCurrentUser();
      setUser(user);
      return { accessToken, user };
    },
    staleTime: 5 * 60 * 1000,
    throwOnError: false,
    ...(token ? {} : { initialData: undefined }),
    select: (session) => session,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const accessToken = await login(email, password);
      setToken(accessToken);
      const user = await getCurrentUser();
      return { accessToken, user };
    },
    onSuccess: (session) => {
      setUser(session.user);
      queryClient.setQueryData(authQueryKeys.session, session);
      queryClient.setQueryData(authQueryKeys.user, session.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
  });
}