import { create } from 'zustand';

interface ModalStore {
  activeBusinessId: string | null;
  
  // Follow-up
  isFollowUpModalOpen: boolean;
  editingFollowUp: any | null; // <-- NEW
  openFollowUpModal: (businessId: string, followUp?: any) => void; // <-- NEW ARGUMENT
  closeFollowUpModal: () => void;
  
  // Deactivate
  isDeactivateModalOpen: boolean;
  openDeactivateModal: (businessId: string) => void;
  closeDeactivateModal: () => void;
}
export const useModalStore = create<ModalStore>((set) => ({
  activeBusinessId: null,
  
  isFollowUpModalOpen: false,
  editingFollowUp: null, // <-- NEW
  
  // Accept the followUp and save it!
  openFollowUpModal: (businessId, followUp = null) => 
    set({ isFollowUpModalOpen: true, activeBusinessId: businessId, editingFollowUp: followUp }),
    
  // Clear it when closed!
  closeFollowUpModal: () => 
    set({ isFollowUpModalOpen: false, activeBusinessId: null, editingFollowUp: null }),
  
  isDeactivateModalOpen: false,
  openDeactivateModal: (businessId) => set({ isDeactivateModalOpen: true, activeBusinessId: businessId }),
  closeDeactivateModal: () => set({ isDeactivateModalOpen: false, activeBusinessId: null }),
}));