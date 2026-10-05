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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-center">
        
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${isInactive ? "bg-emerald-100" : "bg-red-100"}`}>
          {isInactive ? <CheckCircle className="h-6 w-6 text-emerald-600" /> : <Slash className="h-6 w-6 text-red-600" />}
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-2">{actionText} Business</h3>
        <p className="text-sm text-slate-500 mb-6">
          Are you sure you want to {actionText.toLowerCase()} <span className="font-semibold text-slate-700">{businessName}</span>?
        </p>

        <div className="flex justify-center gap-3">
          <button onClick={closeDeactivateModal} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors w-full">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={statusMutation.isPending}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors w-full disabled:opacity-50 ${isInactive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {statusMutation.isPending ? "Updating..." : `Yes, ${actionText}`}
          </button>
        </div>
      </div>
    </div>
  );
}