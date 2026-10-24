"use client";

import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";

interface CancelFollowUpDialogProps {
  open: boolean;
  businessName: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function CancelFollowUpDialog({ open, businessName, loading, onOpenChange, onConfirm }: CancelFollowUpDialogProps) {
  return (
    <ManagementConfirmDialog
      open={open}
      title="Cancel follow-up?"
      description={`This will cancel the follow-up for “${businessName}”.`}
      confirmLabel="Cancel follow-up"
      pending={loading}
      onCancel={() => onOpenChange(false)}
      onConfirm={onConfirm}
    />
  );
}
