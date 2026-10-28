"use client";

import { useState, type ReactNode } from "react";
import { Dialog } from "radix-ui";
import { History, X } from "lucide-react";
import EntityActivity from "@/components/common/EntityActivity";
import type { AuditEntityType } from "@/types/audit-log";

export type EntityActivityTarget = { entityType: AuditEntityType; entityId: string; name: string };

export default function EntityActivityButton({ entityType, entityId, name }: EntityActivityTarget) {
  const [open, setOpen] = useState(false);
  if (!entityId) return null;
  return (
    <EntityActivityDialog entityType={entityType} entityId={entityId} name={name} open={open} onOpenChange={setOpen}>
      <button type="button" title={`Activity for ${name}`} aria-label={`Activity for ${name}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted hover:bg-surface-2 hover:text-ink"><History className="size-4" /><span>Activity</span></button>
    </EntityActivityDialog>
  );
}

export function EntityActivityDialog({ entityType, entityId, name, open, onOpenChange, children }: EntityActivityTarget & { open: boolean; onOpenChange: (open: boolean) => void; children?: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div><Dialog.Title className="break-words text-base font-bold text-ink">Activity for {name}</Dialog.Title><Dialog.Description className="mt-1 text-xs text-muted">Recorded changes, newest first.</Dialog.Description></div>
            <Dialog.Close aria-label="Close activity" className="rounded-lg p-2 hover:bg-surface-2"><X className="size-4" /></Dialog.Close>
          </div>
          {open && <EntityActivity entityType={entityType} entityId={entityId} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
