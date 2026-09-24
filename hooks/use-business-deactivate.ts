import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBusinessStatusApi } from "@/lib/business-deactivate-api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export function useUpdateBusinessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { businessId: string, status: string }) => updateBusinessStatusApi(data),
    onSuccess: (_, variables) => {
      toast.success(`Business is now ${variables.status}!`); // Dynamic Toast!
      queryClient.invalidateQueries({ queryKey: ["businesses", variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    }
  });
}