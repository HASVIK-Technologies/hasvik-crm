"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { ACCESS_TOKEN_REFRESH_BUFFER_MS } from "@/lib/auth/auth-config";
import { getCurrentUser, login, logout, refreshAccessToken } from "@/lib/auth/auth-api";
import { SessionChangedError, SessionExpiredError } from "@/lib/auth/session-controller";
import { restoreSession } from "@/lib/auth/restore-session";
import { tokenRefreshDelay } from "@/lib/auth/token-expiry";
import { broadcastAuthChange, rememberLogout, sessionController, wasLoggedOut } from "@/lib/auth/session-service";
import { useAuthStore } from "@/store/auth-store";
import type { AuthSession } from "@/types/auth";

export const authQueryKeys = {
  session: ["auth", "session"] as const,
  user: ["auth", "user"] as const,
};

export function useTokenRefresh() {
  const token = useAuthStore((state) => state.token);
  const expiresAt = useAuthStore((state) => state.tokenExpiresAt);
  const status = useAuthStore((state) => state.status);
  useEffect(() => {
    if (!token || !expiresAt || status !== "authenticated") return;
    let disposed = false;
    let running = false;
    let timer: number;
    const schedule = (delay: number) => { timer = window.setTimeout(refresh, Math.max(1000, delay)); };
    const refresh = async () => {
      if (disposed || running) return;
      running = true;
      window.clearTimeout(timer);
      try {
        await refreshAccessToken();
        if (!disposed) schedule(Math.max(5000, tokenRefreshDelay(useAuthStore.getState().tokenExpiresAt ?? Date.now())));
      } catch (error) {
        if (!disposed && !(error instanceof SessionExpiredError) && !(error instanceof SessionChangedError) && !axios.isCancel(error)) schedule(30_000);
      } finally { running = false; }
    };
    const resume = () => {
      if (document.visibilityState === "hidden") return;
      if ((useAuthStore.getState().tokenExpiresAt ?? 0) <= Date.now() + ACCESS_TOKEN_REFRESH_BUFFER_MS) void refresh();
    };
    schedule(tokenRefreshDelay(expiresAt));
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener("online", resume);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [token, expiresAt, status]);
}

export function useAuthSession(enabled = true) {
  const blocked = useAuthStore((state) => state.restoreBlocked);
  const loggingOut = useAuthStore((state) => state.isLoggingOut);
  return useQuery({
    queryKey: authQueryKeys.session,
    enabled: enabled && !blocked && !loggingOut,
    retry: false,
    queryFn: async ({ signal }): Promise<AuthSession | null> => {
      if (wasLoggedOut()) { useAuthStore.getState().clearAuth(); return null; }
      const version = useAuthStore.getState().sessionVersion;
      try {
        return await restoreSession({
          snapshot: () => useAuthStore.getState(),
          refresh: refreshAccessToken,
          getUser: (signal) => getCurrentUser(false, signal),
          commit: (token, user) => useAuthStore.getState().setSession(token, user),
          signal,
        });
      } catch (error) {
        if (version !== useAuthStore.getState().sessionVersion || error instanceof SessionExpiredError || error instanceof SessionChangedError || axios.isCancel(error)) return null;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    throwOnError: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    gcTime: 0,
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const version = useAuthStore.getState().beginLogin();
      sessionController.cancel();
      await queryClient.cancelQueries();
      queryClient.removeQueries();
      try {
        const accessToken = await login(email, password);
        if (version !== useAuthStore.getState().sessionVersion) throw new SessionChangedError();
        useAuthStore.getState().setToken(accessToken);
        const user = await getCurrentUser(true);
        if (version !== useAuthStore.getState().sessionVersion) throw new SessionChangedError();
        return { accessToken, user, version };
      } catch (error) {
        if (version === useAuthStore.getState().sessionVersion) useAuthStore.getState().clearAuth();
        throw error;
      }
    },
    onSuccess: (session) => {
      if (session.version !== useAuthStore.getState().sessionVersion) throw new SessionChangedError();
      rememberLogout(false);
      toast.dismiss();
      useAuthStore.getState().setSession(session.accessToken, session.user);
      queryClient.setQueryData(authQueryKeys.session, { accessToken: session.accessToken, user: session.user });
      queryClient.setQueryData(authQueryKeys.user, session.user);
      broadcastAuthChange("login");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = useAuthStore.getState().token;
      useAuthStore.getState().beginLogout();
      const version = useAuthStore.getState().sessionVersion;
      rememberLogout(true);
      sessionController.cancel();
      broadcastAuthChange("logout");
      toast.dismiss();
      await queryClient.cancelQueries();
      queryClient.removeQueries();
      try { await logout(token); } catch { /* Local logout succeeds even if revocation is unavailable. */ }
      finally {
        if (version === useAuthStore.getState().sessionVersion) {
          queryClient.clear();
          useAuthStore.getState().finishLogout();
          broadcastAuthChange("logout");
        }
      }
    },
  });
}
