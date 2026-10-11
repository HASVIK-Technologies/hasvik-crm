"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBusinessCategory,
  getBusinessCategories,
  setBusinessCategoryStatus,
  updateBusinessCategory,
} from "@/lib/categories/api";
import type { CategoryPayload } from "@/types/category";

export const businessCategoryQueryKeys = {
  all: ["business-category-management"] as const,
  list: (
    search: string,
    includeInactive: boolean,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: "asc" | "desc",
  ) =>
    [...businessCategoryQueryKeys.all, "list", search, includeInactive, page, limit, sortBy, sortOrder] as const,
};

export function useBusinessCategoriesQuery(
  search: string,
  includeInactive = false,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder: "asc" | "desc" = "asc",
) {
  return useQuery({
    queryKey: businessCategoryQueryKeys.list(
      search,
      includeInactive,
      page,
      limit,
      sortBy,
      sortOrder,
    ),
    queryFn: ({ signal }) =>
      getBusinessCategories(
        signal,
        search,
        includeInactive ? undefined : true,
        page,
        limit,
        sortBy,
        sortOrder,
      ),
  });
}

function useRefreshCategories() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: businessCategoryQueryKeys.all,
      }),
      queryClient.invalidateQueries({ queryKey: ["filters", "categories"] }),
      queryClient.invalidateQueries({ queryKey: ["businesses"] }),
    ]);
}

export function useCreateBusinessCategory() {
  const refresh = useRefreshCategories();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => createBusinessCategory(payload),
    onSuccess: () => {
      void refresh();
      toast.success("Business category created.");
    },
  });
}

export function useUpdateBusinessCategory() {
  const refresh = useRefreshCategories();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CategoryPayload>;
    }) => updateBusinessCategory(id, payload),
    onSuccess: () => {
      void refresh();
      toast.success("Business category updated.");
    },
  });
}

export function useSetBusinessCategoryStatus() {
  const refresh = useRefreshCategories();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setBusinessCategoryStatus(id, isActive),
    onSuccess: (_, variables) => {
      void refresh();
      toast.success(
        variables.isActive
          ? "Business category activated."
          : "Business category deactivated.",
      );
    },
  });
}
