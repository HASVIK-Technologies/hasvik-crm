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
      <p className={`border-l-2 px-3 py-2 text-xs leading-relaxed ${isActivating ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-red-500 bg-red-50 text-red-800"}`}>
        {isActivating ? "Standard operations and editing will be restored." : "Editing will be disabled until the business is reactivated."}
      </p>
    </ManagementConfirmDialog>
  );
}
