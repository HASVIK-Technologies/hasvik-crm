"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  FollowUpItem,
  UpdateFollowUpPayload,
  UpdateFollowUpStatusPayload,
} from "@/types/follow-up";
import { followUpQueryKeys } from "@/lib/query/query-keys";

export function useFollowUpsQuery(filters: FollowUpFilters) {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all });
    },
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFollowUpPayload) => updateFollowUp(payload),
    onSuccess: (data, variables) => {
      const id = variables.id || variables.followUpId;
      if (id) {
        queryClient.setQueryData(
          followUpQueryKeys.detail(id),
          (old: FollowUpItem | undefined) => {
            const nextNotes =
              variables.notes !== undefined
                ? variables.notes.trim()
                : (data?.notes ?? old?.notes);
            if (!old) {
              return {
                ...data,
                notes: nextNotes,
              };
            }
            return {
              ...old,
              ...data,
              notes: nextNotes,
              reminder:
                variables.reminder !== undefined
                  ? variables.reminder
                  : (data?.reminder ?? old.reminder),
              type: variables.type || data?.type || old.type,
              scheduledAt:
                variables.scheduledAt || data?.scheduledAt || old.scheduledAt,
            };
          },
        );
      }
      // Invalidate follow-up list and kpis queries without wiping out detail cache
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === followUpQueryKeys.all[0] &&
          query.queryKey[1] !== "detail",
      });
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
    },
  });
}
