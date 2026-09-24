import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFollowUpApi, CreateFollowUpPayload } from "@/lib/business-add-follow-up-api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export function useCreateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpPayload) => createFollowUpApi(data),
    onSuccess: (_, variables) => {
      toast.success("Follow-up scheduled successfully!");
      // This tells TanStack to fetch the latest data for this specific business
      queryClient.invalidateQueries({ queryKey: ["followUps", variables.businessId] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error)); // Beautiful error toasts!
    }
  });
}