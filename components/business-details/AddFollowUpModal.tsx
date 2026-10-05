"use client";

import FollowUpFormDialog from "@/components/follow-ups/FollowUpFormDialog";
import { useModalStore } from "@/store/business-modal-store";

interface AddFollowUpModalProps {
  businessName: string;
}

export function AddFollowUpModal({ businessName }: AddFollowUpModalProps) {
  const {
    isFollowUpModalOpen,
    activeBusinessId,
    editingFollowUp,
    closeFollowUpModal,
  } = useModalStore();

  return (
    <FollowUpFormDialog
      mode={editingFollowUp ? "edit" : "create"}
      open={isFollowUpModalOpen}
      onOpenChange={(open) => {
        if (!open) closeFollowUpModal();
      }}
      initialBusiness={
        activeBusinessId
          ? { id: activeBusinessId, label: businessName }
          : undefined
      }
      followUp={editingFollowUp ?? undefined}
    />
  );
}
