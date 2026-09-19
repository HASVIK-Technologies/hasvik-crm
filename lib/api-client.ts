import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { getApiErrorMessage } from "@/lib/api-error";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://crm-backend-three-phi.vercel.app";

export const apiClient = axios.create({
  baseURL: `${apiBaseUrl.replace(/\/+$/, "")}/api`,
  timeout: 45_000,
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
  (error: unknown) => {
    // If request was aborted/cancelled (e.g. by new search keystroke), do not display error toast
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }

    if (typeof window !== "undefined") {
      toast.error(getApiErrorMessage(error));
    }

    return Promise.reject(error);
  },
);