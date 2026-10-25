import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { attachRequestAuth } from "@/lib/auth/request-auth";
import { sessionController } from "@/lib/auth/session-service";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 45_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

attachRequestAuth(apiClient, {
  snapshot: () => useAuthStore.getState(),
  refresh: () => sessionController.refresh(),
  expire: () => useAuthStore.getState().clearAuth(),
  notify: (error, refreshFailure) => {
    if (typeof window !== "undefined") toast.error(getApiErrorMessage(error), refreshFailure ? { id: "auth-refresh-unavailable" } : undefined);
  },
});
