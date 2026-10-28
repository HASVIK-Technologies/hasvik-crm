"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Modal that slides up as a bottom sheet on phones and is a centred dialog from `sm` up.
 * Focus is trapped, Escape and the overlay close it, and focus returns to the trigger.
 */
export default function BottomSheet({ open, onOpenChange, title, description, children, footer, className }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fade-up fixed inset-0 z-50 bg-ink/55 backdrop-blur-[3px]" />
        <Dialog.Content
          aria-describedby={description ? undefined : undefined}
          className={cn(
            "sheet-up fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-3xl border border-line bg-surface shadow-float outline-none",
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-bold tracking-tight text-ink">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-0.5 text-sm text-muted">{description}</Dialog.Description>}
            </div>
            <Dialog.Close aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface-2 sm:size-10">
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="border-t border-line px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
