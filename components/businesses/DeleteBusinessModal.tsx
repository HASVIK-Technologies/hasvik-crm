"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { Trash2, X } from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import { Button } from "@/components/ui/button";

interface DeleteBusinessModalProps {
  isOpen: boolean;
  businessName?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteBusinessModal({
  isOpen,
  businessName,
  onCancel,
  onConfirm,
}: DeleteBusinessModalProps) {
  return (
    <AlertDialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-2xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-4 top-4 rounded-lg p-1 text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0b63e5]/20"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Trash2 className="size-5 text-[#d92d20]" />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <AlertDialogPrimitive.Title className="text-base font-bold tracking-tight text-[#0f172a]">
                Delete Business
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-[#475569]">
                Are you sure you want to delete
                {businessName ? (
                  <>
                    {" "}
                    <span className="font-semibold text-[#0f172a]">
                      &ldquo;{businessName}&rdquo;
                    </span>
                  </>
                ) : (
                  ""
                )}
                ?
              </AlertDialogPrimitive.Description>
              <p className="mt-1 text-xs text-[#94a3b8]">
                This action cannot be undone and will permanently remove this business.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <AlertDialogPrimitive.Cancel asChild>
              <OutlinedButton
                type="button"
                onClick={onCancel}
                className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#334155] shadow-xs transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
              >
                Cancel
              </OutlinedButton>
            </AlertDialogPrimitive.Cancel>

            <AlertDialogPrimitive.Action asChild>
              <Button
                type="button"
                onClick={onConfirm}
                className="h-10 rounded-xl bg-[#d92d20] px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#b42318] focus-visible:ring-2 focus-visible:ring-red-500/20"
              >
                Delete
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
