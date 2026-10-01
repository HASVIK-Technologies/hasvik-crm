import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { getApiErrorMessage } from "@/lib/api-error";

export const apiClient = axios.create({
  // Use the same-origin Next proxy so credentialed cookie requests avoid backend CORS.
  baseURL: "/api",
  timeout: 45_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // If request was aborted/cancelled (e.g. by new search keystroke), do not display error toast
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestConfig = error.config as
        | (typeof error.config & { _retry?: boolean })
        | undefined;

      if (
        requestConfig &&
        !requestConfig._retry &&
        requestConfig.url !== "/auth/refresh" &&
        requestConfig.url !== "/auth/login"
      ) {
        requestConfig._retry = true;

        try {
          const refreshResponse = await apiClient.post<{ accessToken: string }>(
            "/auth/refresh",
          );
          useAuthStore.getState().setToken(refreshResponse.data.accessToken);
          requestConfig.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          return apiClient(requestConfig);
        } catch {
          useAuthStore.getState().clearAuth();
        }
      } else {
        useAuthStore.getState().clearAuth();
      }
    }

    if (typeof window !== "undefined") {
      toast.error(getApiErrorMessage(error));
    }

    return Promise.reject(error);
  },
);