"use client";

import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";
import type { BusinessItem } from "@/types/business";

interface ChangeBusinessStatusModalProps {
  isOpen: boolean;
  business: BusinessItem | null;
  targetStatus: "Active" | "Inactive";
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ChangeBusinessStatusModal({ isOpen, business, targetStatus, isLoading = false, onCancel, onConfirm }: ChangeBusinessStatusModalProps) {
  const isActivating = targetStatus === "Active";
  return (
    <ManagementConfirmDialog
      open={isOpen}
      title={isActivating ? "Activate business?" : "Deactivate business?"}
      description={`${business?.name ? `“${business.name}”` : "This business"} will be marked as ${targetStatus.toLowerCase()}.`}
      confirmLabel={isActivating ? "Activate" : "Deactivate"}
      destructive={!isActivating}
      pending={isLoading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <p className={`border-l-2 px-3 py-2 text-xs leading-relaxed ${isActivating ? "border-ok/30 bg-ok-soft text-ok" : "border-bad/30 bg-bad-soft text-bad"}`}>
        {isActivating ? "Standard operations and editing will be restored." : "Editing will be disabled until the business is reactivated."}
      </p>
    </ManagementConfirmDialog>
  );
}
