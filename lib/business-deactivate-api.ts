import { apiClient } from "@/lib/api-client";

export const updateBusinessStatusApi = async (data: { businessId: string, status: string }) => {
  const response = await apiClient.patch(`/businesses/${data.businessId}`, { 
    status: data.status 
  }); 
  return response.data;
};