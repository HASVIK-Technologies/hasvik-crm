import { useQuery } from "@tanstack/react-query";
import { getFollowUpsByBusiness } from "@/lib/follow-ups/api";
import { followUpQueryKeys } from "@/lib/query/query-keys";

export function useBusinessFollowUpsQuery(businessId: string) {
  return useQuery({
    queryKey: followUpQueryKeys.byBusiness(businessId),
    queryFn: ({ signal }) => getFollowUpsByBusiness(businessId, signal),
    enabled: Boolean(businessId),
  });
}