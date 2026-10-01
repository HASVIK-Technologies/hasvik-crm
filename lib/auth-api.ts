import { apiClient } from "@/lib/api-client";
import type { AuthUser, TokenResponse } from "@/types/auth";

export async function login(email: string, password: string) {
  const response = await apiClient.post<TokenResponse>("/auth/login", {
    email,
    password,
  });
  return response.data.accessToken;
}

export async function refreshAccessToken() {
  const response = await apiClient.post<TokenResponse>("/auth/refresh");
  return response.data.accessToken;
}

export async function getCurrentUser() {
  const response = await apiClient.get<AuthUser>("/auth/me");
  return response.data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}