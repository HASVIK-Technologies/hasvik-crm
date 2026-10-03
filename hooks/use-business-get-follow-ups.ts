import { useQuery } from "@tanstack/react-query";
import { getBusinessFollowUpsApi } from "@/lib/business-get-follow-ups-api";

export function useBusinessFollowUpsQuery(businessId: string) {
  return useQuery({
    // This key matches the one we invalidated in Add Follow-up!
    queryKey: ["followUps", businessId], 
    queryFn: () => getBusinessFollowUpsApi(businessId),
    enabled: !!businessId, // Only fetch if we have an ID
  });
}