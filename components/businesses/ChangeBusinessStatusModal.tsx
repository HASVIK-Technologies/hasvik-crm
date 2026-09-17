"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import { Button } from "@/components/ui/button";
import type { BusinessItem } from "@/types/business";

interface ChangeBusinessStatusModalProps {
  isOpen: boolean;
  business: BusinessItem | null;
  targetStatus: "Active" | "Inactive";
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ChangeBusinessStatusModal({
  isOpen,
  business,
  targetStatus,
  isLoading = false,
  onCancel,
  onConfirm,
}: ChangeBusinessStatusModalProps) {
  const isActivating = targetStatus === "Active";

  return (
    <AlertDialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onCancel();
      }}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content
          className={`fixed left-1/2 top-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-2xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${
            isActivating
              ? "border-emerald-200 bg-white"
              : "border-red-200 bg-white"
          }`}
        >

          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="absolute right-4 top-4 rounded-lg p-1 text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-start gap-4">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
                isActivating
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm"
                  : "border-red-200 bg-red-50 text-red-600 shadow-sm"
              }`}
            >
              {isActivating ? (
                <CheckCircle2 className="size-5 text-emerald-600" />
              ) : (
                <AlertCircle className="size-5 text-red-600" />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <AlertDialogPrimitive.Title
                className={`text-base font-bold tracking-tight ${
                  isActivating ? "text-emerald-950" : "text-red-950"
                }`}
              >
                {isActivating ? "Activate Business?" : "Deactivate Business?"}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-[#475569]">
                Are you sure you want to {isActivating ? "activate" : "deactivate"}
                {business?.name ? (
                  <>
                    {" "}
                    <span className="font-semibold text-[#0f172a]">
                      &ldquo;{business.name}&rdquo;
                    </span>
                  </>
                ) : (
                  " this business"
                )}
                ?
              </AlertDialogPrimitive.Description>
              <div
                className={`mt-3 rounded-lg border p-2.5 text-xs leading-relaxed ${
                  isActivating
                    ? "border-emerald-100 bg-emerald-50/70 text-emerald-800"
                    : "border-red-100 bg-red-50/70 text-red-800"
                }`}
              >
                {isActivating
                  ? "This business will be marked as active. Standard operations and editing will be restored."
                  : "This business will be marked as inactive. Editing will be disabled until it is reactivated."}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <AlertDialogPrimitive.Cancel asChild>
              <OutlinedButton
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#334155] shadow-xs transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a] disabled:pointer-events-none disabled:opacity-50"
              >
                Cancel
              </OutlinedButton>
            </AlertDialogPrimitive.Cancel>

            <AlertDialogPrimitive.Action asChild>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`h-10 rounded-xl px-4.5 text-sm font-semibold text-white shadow-xs transition-colors disabled:pointer-events-none disabled:opacity-60 ${
                  isActivating
                    ? "bg-[#039855] hover:bg-[#027a48] focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                    : "bg-[#d92d20] hover:bg-[#b42318] focus-visible:ring-2 focus-visible:ring-red-500/20"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Updating...
                  </span>
                ) : isActivating ? (
                  "Activate"
                ) : (
                  "Deactivate"
                )}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
