import { apiClient } from "@/lib/api-client";

export const updateBusinessStatusApi = async (data: { businessId: string, isActive: boolean }) => {
  const response = await apiClient.patch(`/businesses/${data.businessId}`, { 
    isActive: data.isActive 
  }); 
  return response.data;
};