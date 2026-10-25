import { apiClient } from "@/lib/api/api-client";
import axios from "axios";
import { authTransport } from "@/lib/auth/auth-transport";
import { sessionController, withAuthLock } from "@/lib/auth/session-service";
import { revokeSession } from "@/lib/auth/logout-session";
import type { TokenResponse } from "@/types/auth";
import { normalizeAuthUser } from "@/lib/auth/normalize-user";

export async function login(email: string, password: string) {
  const response = await withAuthLock(() => authTransport.post<TokenResponse>("/auth/login", { email, password })).catch((error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) throw new Error("Email or password is incorrect.");
    throw error;
  });
  if (typeof response.data.accessToken !== "string" || !response.data.accessToken.trim()) throw new Error("The authentication service returned an invalid token.");
  return response.data.accessToken;
}

export function refreshAccessToken() { return sessionController.refresh(); }

export async function getCurrentUser(skipAuthRefresh = false, signal?: AbortSignal) {
  const response = await apiClient.get<unknown>("/auth/me", { silent: true, skipAuthRefresh, signal });
  return normalizeAuthUser(response.data);
}

export async function logout(token?: string | null) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    await withAuthLock(() => revokeSession({
      token,
      logout: async (bearer) => { await authTransport.post("/auth/logout", undefined, { signal: controller.signal, headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined }); },
      refresh: async () => {
        const response = await authTransport.post<TokenResponse>("/auth/refresh", undefined, { signal: controller.signal });
        if (typeof response.data.accessToken !== "string" || !response.data.accessToken.trim()) throw new Error("Invalid token during session revocation.");
        return response.data.accessToken;
      },
      isUnauthorized: (error) => axios.isAxiosError(error) && error.response?.status === 401,
    }), controller.signal);
  } finally { clearTimeout(timer); }
}
