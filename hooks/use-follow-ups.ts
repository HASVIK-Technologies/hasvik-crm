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
} from "@/lib/follow-up-api";
import type {
  CreateFollowUpPayload,
  FollowUpFilters,
  UpdateFollowUpPayload,
  UpdateFollowUpStatusPayload,
} from "@/types/follow-up";

export function useFollowUpsQuery(filters: FollowUpFilters) {
  return useQuery({
    queryKey: ["follow-ups", filters],
    queryFn: ({ signal }) => getFollowUps(filters, signal),
    placeholderData: (previous) => previous,
  });
}

export function useFollowUpKpisQuery(params?: Partial<FollowUpFilters>) {
  return useQuery({
    queryKey: ["follow-ups", "kpis", params],
    queryFn: ({ signal }) => getFollowUpKpis(params, signal),
    staleTime: 30_000,
  });
}

export function useFollowUpQuery(id?: string) {
  return useQuery({
    queryKey: ["follow-ups", "detail", id],
    queryFn: ({ signal }) => getFollowUp(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useFollowUpStatusesQuery() {
  return useQuery({
    queryKey: ["follow-ups", "statuses"],
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
    queryKey: [path, "autocomplete", search],
    queryFn: ({ signal }) => getFollowUpOptions(path, search, signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useFollowUpsByBusinessQuery(businessId?: string) {
  return useQuery({
    queryKey: ["follow-ups", "business", businessId],
    queryFn: ({ signal }) => getFollowUpsByBusiness(businessId as string, signal),
    enabled: Boolean(businessId),
  });
}

export function useFollowUpsByUserQuery(userId?: string) {
  return useQuery({
    queryKey: ["follow-ups", "user", userId],
    queryFn: ({ signal }) => getFollowUpsByUser(userId as string, signal),
    enabled: Boolean(userId),
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFollowUpPayload) => createFollowUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFollowUpPayload) => updateFollowUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
  });
}

export function useUpdateFollowUpStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFollowUpStatusPayload) =>
      updateFollowUpStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
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
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
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
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
  });
}
