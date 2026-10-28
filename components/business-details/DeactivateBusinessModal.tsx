import React from "react";
import { Slash, CheckCircle } from "lucide-react";
import { useModalStore } from "@/store/business-modal-store";
import { useUpdateBusinessStatus } from "@/hooks/use-businesses";

// 1. Change the prop to boolean!
interface ModalProps {
  businessName: string;
  businessStatus: string; // We put status back!
  businessIsActive?: boolean; 
}

export function DeactivateBusinessModal({ businessName, businessStatus, businessIsActive }: ModalProps) {
  const { isDeactivateModalOpen, closeDeactivateModal, activeBusinessId } = useModalStore();
  const statusMutation = useUpdateBusinessStatus();

  // Now it safely checks both!
  const isInactive = businessStatus?.toLowerCase() === "inactive" || businessIsActive === false;
  
  const newIsActiveState = isInactive ? true : false;
  const actionText = isInactive ? "Activate" : "Deactivate";

  const handleConfirm = async () => {
    if (!activeBusinessId) return;
    try {
      await statusMutation.mutateAsync({
        id: activeBusinessId,
        status: newIsActiveState ? "Active" : "Inactive",
      });
      closeDeactivateModal(); 
    } catch {
      // Error handled by hook
    }
  };

  if (!isDeactivateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-line text-center">
        
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${isInactive ? "bg-surface-2/10" : "bg-bad-soft"}`}>
          {isInactive ? <CheckCircle className="h-6 w-6 text-accent-strong" /> : <Slash className="h-6 w-6 text-bad" />}
        </div>
        
        <h3 className="text-lg font-bold text-ink mb-2">{actionText} Business</h3>
        <p className="text-sm text-muted mb-6">
          Are you sure you want to {actionText.toLowerCase()} <span className="font-semibold text-ink-soft">{businessName}</span>?
        </p>

        <div className="flex justify-center gap-3">
          <button onClick={closeDeactivateModal} className="px-5 py-2.5 text-sm font-medium text-ink-soft bg-surface border border-line rounded-xl hover:bg-surface-2 transition-colors w-full">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={statusMutation.isPending}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors w-full disabled:opacity-50 ${isInactive ? "bg-surface-2 text-secondary-foreground hover:bg-surface-2/90" : "bg-bad text-white hover:bg-bad"}`}
          >
            {statusMutation.isPending ? "Updating..." : `Yes, ${actionText}`}
          </button>
        </div>
      </div>
    </div>
  );
}