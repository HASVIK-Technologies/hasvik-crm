import { apiClient } from "@/lib/api-client";

export const getBusinessFollowUpsApi = async (businessId: string) => {
  // Use your proxy URL again! 
  const response = await apiClient.get(`/follow-ups/business/${businessId}`);
  return response.data;
};