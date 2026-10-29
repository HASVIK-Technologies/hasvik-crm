"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { authEventKey, authTabId, rememberLogout, sessionController } from "@/lib/auth/session-service";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { registerServiceWorker } from "@/lib/pwa/install";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);
  const loggingOut = useAuthStore((state) => state.isLoggingOut);
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, previous) => {
      if (state.sessionVersion !== previous.sessionVersion) {
        void queryClient.cancelQueries();
        queryClient.removeQueries();
        toast.dismiss();
      }
    });
    const receive = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      const event = value as { source?: unknown; type?: unknown };
      if (event.source === authTabId || !["login", "logout"].includes(String(event.type))) return;
      sessionController.cancel();
      useAuthStore.getState().clearAuth();
      rememberLogout(event.type === "logout");
      if (event.type === "login") useAuthStore.getState().allowRestore();
    };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(authEventKey) : undefined;
    if (channel) channel.onmessage = (event) => receive(event.data);
    const storage = (event: StorageEvent) => {
      if (event.key !== authEventKey || !event.newValue) return;
      try { receive(JSON.parse(event.newValue)); } catch { /* Ignore unrelated or malformed messages. */ }
    };
    // BroadcastChannel is preferred; storage is the fallback, avoiding duplicates.
    if (!channel) window.addEventListener("storage", storage);
    return () => { unsubscribe(); channel?.close(); window.removeEventListener("storage", storage); };
  }, [queryClient]);
  const showToasts = !loggingOut && pathname !== "/" && (status === "authenticated" || pathname === "/tenant" || pathname === "/explore-crm");

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showToasts && <Toaster position="top-right" closeButton richColors />}
    </QueryClientProvider>
  );
}