"use client";

import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { getInstallState, getServerInstallState, promptInstall, subscribeInstall } from "@/lib/pwa/install";

/** Whether this device can install HASVIK CRM as an app, and a function that opens the install dialog. */
export function useInstallApp() {
  const state = useSyncExternalStore(subscribeInstall, getInstallState, getServerInstallState);
  const install = async () => {
    if (await promptInstall()) toast.success("HASVIK CRM is installed. Open it from your home screen or desktop.");
  };
  return { state, install };
}
