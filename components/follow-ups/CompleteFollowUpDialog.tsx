"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompleteFollowUpDialogProps {
  open: boolean;
  businessName?: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function CompleteFollowUpDialog({
  open,
  businessName,
  loading,
  onOpenChange,
  onConfirm,
}: CompleteFollowUpDialogProps) {
  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!loading) onOpenChange(next);
      }}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl outline-none">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-lg p-1 text-[#94a3b8] hover:bg-[#f1f5f9]"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <AlertDialogPrimitive.Title className="text-base font-bold text-slate-900">
                Mark as Completed
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-[#475569]">
                Are you sure you want to mark this follow-up as completed?
                {businessName ? (
                  <span className="mt-1 block text-xs text-[#64748b]">
                    Business: <span className="font-semibold text-[#0f172a]">&ldquo;{businessName}&rdquo;</span>
                  </span>
                ) : null}
              </AlertDialogPrimitive.Description>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2.5">
            <AlertDialogPrimitive.Cancel asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="h-10 rounded-xl border-[#d0d5dd] bg-white text-[#344054] hover:bg-[#f8fafc] hover:text-[#0f172a]"
              >
                Cancel
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="h-10 rounded-xl bg-[#0b63e5] px-4 font-semibold text-white shadow-sm hover:bg-[#0951bd]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Completing...
                  </>
                ) : (
                  "Mark as Completed"
                )}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
