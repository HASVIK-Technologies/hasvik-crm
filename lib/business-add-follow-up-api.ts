import { apiClient } from "@/lib/api-client";

// Define exactly what the backend expects
export interface CreateFollowUpPayload {
  businessId: string;
  assignedTo: string;
  type: string;
  scheduledAt: string;
  status: string;
  notes: string;
}

export const createFollowUpApi = async (data: CreateFollowUpPayload) => {
    // apiClient automatically attaches the domain from .env and the Zustand Auth Token!
    const response = await apiClient.post("/follow-ups", data); 
    return response.data;
  };