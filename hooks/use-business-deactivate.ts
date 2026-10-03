import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBusinessStatusApi } from "@/lib/business-deactivate-api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export function useUpdateBusinessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { businessId: string, isActive: boolean }) => updateBusinessStatusApi(data),
    onSuccess: (_, variables) => {
      const statusText = variables.isActive ? "Activated" : "Deactivated";
      toast.success(`Business successfully ${statusText}!`); 
      
      queryClient.invalidateQueries({ queryKey: ["business", variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });    
    }
  });
}