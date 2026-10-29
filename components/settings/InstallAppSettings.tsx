"use client";

import { CheckCircle2, Download, Share, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallApp } from "@/hooks/use-install-app";

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand-strong">{n}</span>
      <span className="pt-0.5 text-sm text-ink-soft">{children}</span>
    </li>
  );
}

export default function InstallAppSettings() {
  const { state, install } = useInstallApp();
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-ink">Install HASVIK CRM on this device</h3>
        <p className="mt-1 text-sm text-muted">
          It opens in its own window with the HASVIK icon, like any other app, and stays signed in the same way as the website.
        </p>
      </div>

      {state === "installed" && (
        <p className="flex items-center gap-2 rounded-xl bg-ok-soft px-4 py-3 text-sm font-semibold text-ok">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          Installed. You are using the app version right now.
        </p>
      )}

      {state === "available" && (
        <Button type="button" onClick={() => void install()} className="h-11 w-full sm:w-auto">
          <Download className="size-4" aria-hidden />
          Install app
        </Button>
      )}

      {state === "ios" && (
        <ol className="space-y-3">
          <Step n={1}>Open this page in <strong className="text-ink">Safari</strong>.</Step>
          <Step n={2}>Tap the <Share className="inline size-4 align-text-bottom" aria-label="Share" /> <strong className="text-ink">Share</strong> button.</Step>
          <Step n={3}>Choose <SquarePlus className="inline size-4 align-text-bottom" aria-hidden /> <strong className="text-ink">Add to Home Screen</strong>, then <strong className="text-ink">Add</strong>.</Step>
        </ol>
      )}

      {state === "unsupported" && (
        <ol className="space-y-3">
          <Step n={1}>Open this site in <strong className="text-ink">Google Chrome</strong> or <strong className="text-ink">Microsoft Edge</strong>.</Step>
          <Step n={2}>Click the install icon at the right end of the address bar, or open the <strong className="text-ink">⋮</strong> menu and choose <strong className="text-ink">Cast, save and share → Install page as app</strong>.</Step>
          <Step n={3}>On Android, open the <strong className="text-ink">⋮</strong> menu and tap <strong className="text-ink">Add to Home screen</strong> or <strong className="text-ink">Install app</strong>.</Step>
        </ol>
      )}
    </div>
  );
}
