"use client";

import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";

interface CompleteFollowUpDialogProps {
  open: boolean;
  businessName?: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function CompleteFollowUpDialog({ open, businessName, loading, onOpenChange, onConfirm }: CompleteFollowUpDialogProps) {
  return (
    <ManagementConfirmDialog
      open={open}
      title="Mark as completed?"
      description={`This follow-up${businessName ? ` for “${businessName}”` : ""} will be marked as completed.`}
      confirmLabel="Mark as completed"
      destructive={false}
      pending={loading}
      onCancel={() => onOpenChange(false)}
      onConfirm={onConfirm}
    />
  );
}
