import { create } from 'zustand';
import type { FollowUpItem } from "@/types/follow-up";

interface ModalStore {
  activeBusinessId: string | null;
  
  // Follow-up
  isFollowUpModalOpen: boolean;
  editingFollowUp: FollowUpItem | null;
  openFollowUpModal: (
    businessId: string,
    followUp?: FollowUpItem | null,
  ) => void;
  closeFollowUpModal: () => void;
  
  // Deactivate
  isDeactivateModalOpen: boolean;
  openDeactivateModal: (businessId: string) => void;
  closeDeactivateModal: () => void;
}
export const useModalStore = create<ModalStore>((set) => ({
  activeBusinessId: null,
  
  isFollowUpModalOpen: false,
  editingFollowUp: null,
  
  openFollowUpModal: (businessId, followUp = null) =>
    set({
      isFollowUpModalOpen: true,
      activeBusinessId: businessId,
      editingFollowUp: followUp,
    }),
    
  closeFollowUpModal: () =>
    set({ isFollowUpModalOpen: false, activeBusinessId: null, editingFollowUp: null }),
  
  isDeactivateModalOpen: false,
  openDeactivateModal: (businessId) => set({ isDeactivateModalOpen: true, activeBusinessId: businessId }),
  closeDeactivateModal: () => set({ isDeactivateModalOpen: false, activeBusinessId: null }),
}));