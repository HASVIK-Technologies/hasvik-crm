import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  createBusinessData,
  createBusinessRequest,
  getBusinesses as fetchBusinesses,
  getBusinessKpis,
  getBusinessRaw,
  getCategories,
  updateBusinessData,
  updateBusinessStatus,
  type ApiCategory,
} from "@/lib/business/api";
import { toBusinessItem, toCreateBusinessPayload } from "@/lib/business/mappers";
import { updateBusiness } from "@/lib/business/store";
import {
  businessQueryKeys,
} from "@/lib/query/query-keys";
import type { BusinessItem } from "@/types/business";
import type {
  ApiBusiness,
  BusinessKpiParams,
  BusinessQueryParams,
  BusinessesResult,
} from "@/types/business-api";
import type { BusinessFormValues } from "@/lib/business/form-types";
import { useBusinessListStore } from "@/store/business-list-store";

const defaultQueryParams: Required<
  Pick<BusinessQueryParams, "page" | "limit" | "sortBy">
> = {
  page: 1,
  limit: 20,
  sortBy: "-createdAt",
};

export async function getBusinesses(
  params: BusinessQueryParams = {},
  signal?: AbortSignal,
): Promise<BusinessesResult> {
  const mergedParams = { ...defaultQueryParams, ...params };
  const response = await fetchBusinesses(mergedParams, signal);
  const limit = mergedParams.limit ?? defaultQueryParams.limit;
  const total = response.total ?? response.data?.length ?? 0;

  return {
    businesses: (response.data ?? []).map(toBusinessItem),
    total,
    totalPages:
      response.totalPages ?? Math.max(1, Math.ceil(total / limit)),
  };
}

export function useBusinessesQuery(
  params: BusinessQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: businessQueryKeys.list(params),
    queryFn: ({ signal }) => getBusinesses(params, signal),
    placeholderData: (previousData) => previousData,
    retry: 2,
    retryDelay: 1000,
    enabled: options?.enabled ?? true,
  });
}

export function useUpdateBusinessLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      updateBusinessData(String(id), { status }),
    onSuccess: (_, variables) => {
      useBusinessListStore.getState().highlightBusiness(variables.id);
      queryClient.setQueriesData(
        { queryKey: businessQueryKeys.lists() },
        (oldData: BusinessesResult | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            businesses: oldData.businesses.map((item) =>
              String(item.id) === String(variables.id)
                ? { ...item, leadStatus: variables.status }
                : item,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: businessQueryKeys.detail(String(variables.id)),
      });
      toast.success("Lead stage updated.");
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(message || "Failed to update lead stage.");
    },
  });
}

export function useAssignBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      assigneeId,
    }: {
      id: string | number;
      assigneeId: string;
      assigneeName: string;
    }) => updateBusinessData(String(id), { assignedTo: assigneeId }),
    onSuccess: (_, variables) => {
      useBusinessListStore.getState().highlightBusiness(variables.id);
      queryClient.setQueriesData(
        { queryKey: businessQueryKeys.lists() },
        (oldData: BusinessesResult | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            businesses: oldData.businesses.map((item) =>
              String(item.id) === String(variables.id)
                ? {
                    ...item,
                    assignedToId: variables.assigneeId,
                    assignedToName: variables.assigneeName,
                    assignedTo: variables.assigneeName,
                    owner: variables.assigneeName,
                  }
                : item,
            ),
          };
        },
      );
      queryClient.setQueryData<BusinessItem | undefined>(
        businessQueryKeys.detail(String(variables.id)),
        (business) =>
          business
            ? {
                ...business,
                assignedToId: variables.assigneeId,
                assignedToName: variables.assigneeName,
                assignedTo: variables.assigneeName,
                owner: variables.assigneeName,
              }
            : business,
      );
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
      toast.success(`${variables.assigneeName} is now responsible for this business.`);
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(message || "Failed to assign the responsible person.");
    },
  });
}

export function useBusinessKpisQuery(params: BusinessKpiParams) {
  return useQuery({
    queryKey: businessQueryKeys.kpis(params),
    queryFn: ({ signal }) => getBusinessKpis(params, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 10_000,
    retry: 2,
    retryDelay: 1000,
  });
}

export async function getBusiness(id: string): Promise<BusinessItem> {
  return toBusinessItem(await getBusinessRaw(id));
}

export function useBusinessQuery(id: string | undefined) {
  return useQuery({
    queryKey: businessQueryKeys.detail(id),
    queryFn: () => getBusiness(id!),
    enabled: Boolean(id),
  });
}

export function useCategoriesQuery() {
  return useQuery<ApiCategory[]>({
    queryKey: businessQueryKeys.categories(),
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateBusinessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string | number;
      status: "Active" | "Inactive";
    }) => {
      const result = await updateBusinessStatus(id, status);
      updateBusiness(id, { status, isActive: status === "Active" });
      return result;
    },
    onSuccess: (_, variables) => {
      useBusinessListStore.getState().highlightBusiness(variables.id);
      queryClient.setQueriesData(
        { queryKey: businessQueryKeys.lists() },
        (oldData: BusinessesResult | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            businesses: oldData.businesses.map((item) =>
              String(item.id) === String(variables.id)
                ? {
                    ...item,
                    status: variables.status,
                    isActive: variables.status === "Active",
                  }
                : item,
            ),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: businessQueryKeys.detail(String(variables.id)),
      });

      toast.success(
        variables.status === "Active"
          ? "Business activated successfully."
          : "Business deactivated successfully.",
      );
    },
    onError: (error) => {
      if (!axios.isAxiosError(error)) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update business status.",
        );
      }
    },
  });
}

type BusinessMutationPayload = Partial<ApiBusiness> & Record<string, unknown>;

export function useUpdateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BusinessMutationPayload }) =>
      updateBusinessData(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: businessQueryKeys.detail(String(variables.id)),
      });
      toast.success("Business updated successfully.");
    },
    onError: (error) => {
      if (!axios.isAxiosError(error)) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update business.",
        );
      }
    },
  });
}

export function useCreateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BusinessMutationPayload) => createBusinessData(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
      toast.success("Business created successfully.");
    },
    onError: (error) => {
      if (!axios.isAxiosError(error)) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create business.",
        );
      }
    },
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: BusinessFormValues) =>
      createBusinessRequest(toCreateBusinessPayload(values)),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
      toast.success(`${created.name} was added successfully.`);
    },
    onError: (error) => {
      if (!axios.isAxiosError(error)) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create business.",
        );
      }
    },
  });
}
