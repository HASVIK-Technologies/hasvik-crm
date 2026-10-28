"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import { Button } from "@/components/ui/button";

export default function ManagementConfirmDialog({ open, title, description, confirmLabel, destructive = true, pending = false, confirmDisabled = false, children, onCancel, onConfirm }: { open: boolean; title: string; description: string; confirmLabel: string; destructive?: boolean; pending?: boolean; confirmDisabled?: boolean; children?: React.ReactNode; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen && !pending) onCancel(); }}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content className={`fixed left-1/2 top-1/2 z-50 flex max-h-[min(90vh,560px)] w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border bg-surface shadow-card outline-none ${destructive ? "border-bad/30" : "border-ok/30"}`}>
          <header className="flex shrink-0 items-start gap-4 border-b border-line bg-surface-2/80 px-5 py-4 rounded-2xl">
            <span className={`flex size-10 shrink-0 items-center justify-center border ${destructive ? "border-bad/30 bg-bad-soft text-bad" : "border-ok/30 bg-ok-soft text-ok"}`}>{destructive ? <AlertCircle className="size-5" /> : <CheckCircle2 className="size-5" />}</span>
            <div className="min-w-0 flex-1 pt-0.5">
              <AlertDialogPrimitive.Title className="text-base font-bold tracking-tight text-ink">{title}</AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</AlertDialogPrimitive.Description>
            </div>
            <button type="button" onClick={onCancel} disabled={pending} className="shrink-0 border border-transparent p-1.5 text-muted hover:border-line hover:bg-surface hover:text-ink disabled:pointer-events-none disabled:opacity-50" aria-label="Close"><X className="size-4" /></button>
          </header>
          {children ? <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div> : null}
          <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-line bg-surface px-5 py-4 rounded-2xl">
            <AlertDialogPrimitive.Cancel asChild><OutlinedButton type="button" onClick={onCancel} disabled={pending} className="h-10 rounded-xl px-4">Cancel</OutlinedButton></AlertDialogPrimitive.Cancel>
            <Button type="button" onClick={onConfirm} disabled={pending || confirmDisabled} className={`h-10 rounded-xl px-4.5 text-sm font-semibold text-white ${destructive ? "bg-bad hover:bg-bad" : "bg-surface-2 hover:bg-surface-2/90"}`}>{pending ? <span className="flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" />Updating...</span> : confirmLabel}</Button>
          </footer>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
