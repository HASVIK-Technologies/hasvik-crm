"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import { Button } from "@/components/ui/button";

export default function ManagementConfirmDialog({ open, title, description, confirmLabel, destructive = true, pending = false, confirmDisabled = false, children, onCancel, onConfirm }: { open: boolean; title: string; description: string; confirmLabel: string; destructive?: boolean; pending?: boolean; confirmDisabled?: boolean; children?: React.ReactNode; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen && !pending) onCancel(); }}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content className={`fixed left-1/2 top-1/2 z-50 flex max-h-[min(90vh,560px)] w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] outline-none ${destructive ? "border-red-200" : "border-emerald-200"}`}>
          <header className="flex shrink-0 items-start gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <span className={`flex size-10 shrink-0 items-center justify-center border ${destructive ? "border-red-200 bg-red-50 text-red-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{destructive ? <AlertCircle className="size-5" /> : <CheckCircle2 className="size-5" />}</span>
            <div className="min-w-0 flex-1 pt-0.5">
              <AlertDialogPrimitive.Title className="text-base font-bold tracking-tight text-slate-950">{title}</AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</AlertDialogPrimitive.Description>
            </div>
            <button type="button" onClick={onCancel} disabled={pending} className="shrink-0 border border-transparent p-1.5 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50" aria-label="Close"><X className="size-4" /></button>
          </header>
          {children ? <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div> : null}
          <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-200 bg-white px-5 py-4">
            <AlertDialogPrimitive.Cancel asChild><OutlinedButton type="button" onClick={onCancel} disabled={pending} className="h-10 rounded-none px-4">Cancel</OutlinedButton></AlertDialogPrimitive.Cancel>
            <Button type="button" onClick={onConfirm} disabled={pending || confirmDisabled} className={`h-10 rounded-none px-4.5 text-sm font-semibold text-white ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-brand-green hover:bg-brand-green/90"}`}>{pending ? <span className="flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" />Updating...</span> : confirmLabel}</Button>
          </footer>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
