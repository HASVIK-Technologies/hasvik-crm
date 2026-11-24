"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { MessageSquareText, X } from "lucide-react";
import BusinessFollowUpNotesTimeline from "@/components/business-details/BusinessFollowUpNotesTimeline";

export default function BusinessConversationHistoryDrawer({
  businessId,
  businessName,
  open,
  onOpenChange,
}: {
  businessId: string;
  businessName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-blue"><MessageSquareText className="size-5" /></span>
              <div className="min-w-0">
                <DialogPrimitive.Title className="text-base font-bold text-slate-900">Notes</DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 truncate text-xs text-slate-500">{businessName}</DialogPrimitive.Description>
              </div>
            </div>
            <DialogPrimitive.Close asChild>
              <button type="button" aria-label="Close conversation history" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"><X className="size-4" /></button>
            </DialogPrimitive.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <BusinessFollowUpNotesTimeline businessId={businessId} showHeader={false} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
