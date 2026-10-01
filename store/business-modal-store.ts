import { create } from 'zustand';

interface ModalStore {
  activeBusinessId: string | null;
  // Follow-up
  isFollowUpModalOpen: boolean;
  openFollowUpModal: (businessId: string) => void;
  closeFollowUpModal: () => void;
  // Deactivate
  isDeactivateModalOpen: boolean;
  openDeactivateModal: (businessId: string) => void;
  closeDeactivateModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  activeBusinessId: null,
  
  isFollowUpModalOpen: false,
  openFollowUpModal: (businessId) => set({ isFollowUpModalOpen: true, activeBusinessId: businessId }),
  closeFollowUpModal: () => set({ isFollowUpModalOpen: false, activeBusinessId: null }),
  
  isDeactivateModalOpen: false,
  openDeactivateModal: (businessId) => set({ isDeactivateModalOpen: true, activeBusinessId: businessId }),
  closeDeactivateModal: () => set({ isDeactivateModalOpen: false, activeBusinessId: null }),
}));