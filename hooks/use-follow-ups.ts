"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFollowUpListStore } from "@/store/follow-up-list-store";
import {
  createFollowUp,
  getFollowUpKpis,
  getFollowUpOptions,
  getFollowUpStatuses,
  getFollowUp,
  updateFollowUp,
  updateFollowUpStatus,
  cancelFollowUp,
  completeFollowUp,
  getFollowUps,
  getFollowUpsByBusiness,
  getFollowUpsByUser,
} from "@/lib/follow-ups/api";
import type {
  CreateFollowUpPayload,
  FollowUpFilters,
  FollowUpQueryFilters,
  UpdateFollowUpPayload,
  UpdateFollowUpStatusPayload,
} from "@/types/follow-up";
import {
  businessQueryKeys,
  followUpQueryKeys,
} from "@/lib/query/query-keys";

function invalidateBusinessQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
}

export function useFollowUpsQuery(filters: FollowUpQueryFilters) {
  return useQuery({
    queryKey: followUpQueryKeys.list(filters),
    queryFn: ({ signal }) => getFollowUps(filters, signal),
    placeholderData: (previous) => previous,
  });
}

export function useFollowUpKpisQuery(params?: Partial<FollowUpFilters>) {
  return useQuery({
    queryKey: followUpQueryKeys.kpis(params),
    queryFn: ({ signal }) => getFollowUpKpis(params, signal),
    staleTime: 30_000,
  });
}

export function useFollowUpQuery(id?: string) {
  return useQuery({
    queryKey: followUpQueryKeys.detail(id),
    queryFn: ({ signal }) => getFollowUp(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useFollowUpStatusesQuery() {
  return useQuery({
    queryKey: followUpQueryKeys.statuses(),
    queryFn: ({ signal }) => getFollowUpStatuses(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFollowUpAutocomplete(
  path: "/users/autocomplete" | "/businesses/autocomplete",
  search: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: followUpQueryKeys.autocomplete(path, search),
    queryFn: ({ signal }) => getFollowUpOptions(path, search, signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useFollowUpsByBusinessQuery(businessId?: string) {
  return useQuery({
    queryKey: followUpQueryKeys.byBusiness(businessId),
    queryFn: ({ signal }) => getFollowUpsByBusiness(businessId as string, signal),
    enabled: Boolean(businessId),
  });
}

export function useFollowUpsByUserQuery(userId?: string) {
  return useQuery({
    queryKey: followUpQueryKeys.byUser(userId),
    queryFn: ({ signal }) => getFollowUpsByUser(userId as string, signal),
    enabled: Boolean(userId),
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFollowUpPayload) => createFollowUp(payload),
    onSuccess: async (created, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all }),
        invalidateBusinessQueries(queryClient),
      ]);
      useFollowUpListStore.getState().highlightSavedFollowUp(created.id, created.scheduledAt || variables.scheduledAt);
    },
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFollowUpPayload) => updateFollowUp(payload),
    onSuccess: async (updated, variables) => {
      // PATCH responses can be partial. Refetch rather than overwriting cached
      // business, owner, and contact fields with mapper defaults.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all }),
        invalidateBusinessQueries(queryClient),
      ]);
      useFollowUpListStore.getState().highlightSavedFollowUp(updated.id || variables.id || variables.followUpId || "", variables.highlightScheduledAt || updated.scheduledAt || variables.scheduledAt || "");
    },
  });
}

export function useUpdateFollowUpStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFollowUpStatusPayload) =>
      updateFollowUpStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all });
      invalidateBusinessQueries(queryClient);
    },
  });
}

export function useCancelFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      variables:
        | string
        | { id: string; existing?: Partial<UpdateFollowUpPayload> },
    ) => {
      const id = typeof variables === "string" ? variables : variables.id;
      return cancelFollowUp(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all });
      invalidateBusinessQueries(queryClient);
    },
  });
}

export function useCompleteFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: string | { id: string }) => {
      const id = typeof variables === "string" ? variables : variables.id;
      return completeFollowUp(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all });
      invalidateBusinessQueries(queryClient);
    },
  });
}
