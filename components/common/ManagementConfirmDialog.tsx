"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import { Button } from "@/components/ui/button";

export default function ManagementConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive = true,
  pending = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !pending) onCancel();
      }}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content
          className={`fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-2xl outline-none ${
            destructive ? "border-red-200" : "border-brand-green/30"
          }`}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="absolute right-4 top-4 rounded-lg p-1 text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-start gap-4">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
                destructive
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-brand-green/30 bg-brand-green/10 text-brand-green-strong"
              }`}
            >
              {destructive ? (
                <AlertCircle className="size-5" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <AlertDialogPrimitive.Title
                className={`text-base font-bold tracking-tight ${
                  destructive ? "text-red-950" : "text-brand-green-strong"
                }`}
              >
                {title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-[#475569]">
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2.5">
            <AlertDialogPrimitive.Cancel asChild>
              <OutlinedButton
                type="button"
                onClick={onCancel}
                disabled={pending}
                className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#334155] shadow-xs hover:bg-[#f8fafc] disabled:pointer-events-none disabled:opacity-50"
              >
                Cancel
              </OutlinedButton>
            </AlertDialogPrimitive.Cancel>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className={`h-10 rounded-xl px-4.5 text-sm font-semibold text-white shadow-xs disabled:pointer-events-none disabled:opacity-60 ${
                destructive
                  ? "bg-[#d92d20] hover:bg-[#b42318]"
                  : "bg-brand-green hover:bg-brand-green/90"
              }`}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Updating…
                </span>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
