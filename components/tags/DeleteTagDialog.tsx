"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import {
  AlertTriangle,
  Building2,
  Calendar,
  LoaderCircle,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import { Button } from "@/components/ui/button";
import TagBadge from "./TagBadge";
import type { TagItem } from "@/types/tag";
import { getTagAssociations } from "@/lib/tags/utils";

interface DeleteTagDialogProps {
  open: boolean;
  tag: TagItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTagDialog({
  open,
  tag,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteTagDialogProps) {
  if (!tag) return null;

  const associations = getTagAssociations(tag);
  const hasAssociations = associations.total > 0;

  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isDeleting) onClose();
      }}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(92vh,620px)] w-[calc(100%-2rem)] max-w-[500px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border border-rose-200 bg-white shadow-2xl rounded-none outline-none">
          {/* Header */}
          <header className="flex shrink-0 items-start gap-3.5 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center border border-rose-200 bg-rose-50 text-rose-600 rounded-none">
              <Trash2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <AlertDialogPrimitive.Title className="text-base font-bold tracking-tight text-slate-950 flex items-center gap-2 flex-wrap">
                <span>Delete Tag:</span>
                <TagBadge name={tag.name} color={tag.color} />
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-1 text-xs leading-relaxed text-slate-600">
                Are you sure you want to permanently delete this tag?
              </AlertDialogPrimitive.Description>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="shrink-0 border border-transparent p-1.5 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </header>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
            {/* Warning if tag has active associations */}
            {hasAssociations ? (
              <div className="border border-amber-300 bg-amber-50/90 p-3.5 rounded-none text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                  <span>Active Tag Associations Detected</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-amber-800">
                  This tag is currently assigned to existing records in your CRM:
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                  {associations.leadsCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/90 border border-amber-300/80 font-medium text-amber-950 text-xs">
                      <Building2 className="size-3.5 text-amber-700" />
                      <span>{associations.leadsCount} Business Lead(s)</span>
                    </span>
                  )}
                  {associations.followUpsCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/90 border border-amber-300/80 font-medium text-amber-950 text-xs">
                      <Calendar className="size-3.5 text-amber-700" />
                      <span>{associations.followUpsCount} Follow-up(s)</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 bg-slate-50/60 p-3 rounded-none text-xs text-slate-600">
                This tag is not currently assigned to any leads or follow-ups.
              </div>
            )}

            {/* Safe Deletion Guarantee */}
            <div className="border border-emerald-200 bg-emerald-50/60 p-3 rounded-none text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-emerald-900">Safe Deletion Guarantee</p>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  Deleting this tag will <strong className="underline">NOT</strong> delete any associated business leads or follow-up records. All records remain completely safe and intact; only the tag label will be removed.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-200 bg-white px-5 py-3.5">
            <AlertDialogPrimitive.Cancel asChild>
              <OutlinedButton
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="h-9 rounded-none px-4 text-xs"
              >
                Cancel
              </OutlinedButton>
            </AlertDialogPrimitive.Cancel>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="h-9 rounded-none px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-none flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  <span>Delete Tag</span>
                </>
              )}
            </Button>
          </footer>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

