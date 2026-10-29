"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The app's one "are you sure?" dialog. A bottom sheet on phones, a centred card on larger screens.
 * `destructive` paints the confirm button red (delete, discard); otherwise it is the normal primary button.
 */
export default function ManagementConfirmDialog({ open, title, description, confirmLabel, cancelLabel = "Cancel", destructive = true, pending = false, confirmDisabled = false, children, onCancel, onConfirm }: { open: boolean; title: string; description: string; confirmLabel: string; cancelLabel?: string; destructive?: boolean; pending?: boolean; confirmDisabled?: boolean; children?: React.ReactNode; onCancel: () => void; onConfirm: () => void }) {
  const Icon = destructive ? AlertTriangle : CheckCircle2;
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen && !pending) onCancel(); }}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-float outline-none",
            "pb-[env(safe-area-inset-bottom)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4",
            "sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:pb-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95",
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="flex items-start gap-4">
              <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", destructive ? "bg-bad-soft text-bad" : "bg-brand-soft text-brand-strong")}>
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <AlertDialogPrimitive.Title className="text-lg font-semibold tracking-tight text-ink">{title}</AlertDialogPrimitive.Title>
                <AlertDialogPrimitive.Description className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</AlertDialogPrimitive.Description>
              </div>
            </div>
            {children ? <div className="mt-5">{children}</div> : null}
          </div>
          <footer className="flex shrink-0 flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:justify-end sm:gap-3">
            <AlertDialogPrimitive.Cancel asChild>
              <Button type="button" variant="outline" onClick={onCancel} disabled={pending} className="h-11 w-full sm:h-10 sm:w-auto sm:min-w-24">{cancelLabel}</Button>
            </AlertDialogPrimitive.Cancel>
            <Button
              type="button"
              onClick={onConfirm}
              loading={pending}
              disabled={pending || confirmDisabled}
              className={cn("h-11 w-full sm:h-10 sm:w-auto sm:min-w-28", destructive && "bg-bad text-white hover:bg-bad/90")}
            >
              {pending ? "Working…" : confirmLabel}
            </Button>
          </footer>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
