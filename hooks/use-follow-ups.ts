"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFollowUp,
  getFollowUpKpis,
  getFollowUpOptions,
  getFollowUpStatuses,
  getFollowUp,
  updateFollowUp,
  cancelFollowUp,
  getFollowUps,
} from "@/lib/follow-up-api";
import type { CreateFollowUpPayload, FollowUpFilters, UpdateFollowUpPayload } from "@/types/follow-up";

export function useFollowUpsQuery(filters: FollowUpFilters) {
  return useQuery({
    queryKey: ["follow-ups", filters],
    queryFn: ({ signal }) => getFollowUps(filters, signal),
    placeholderData: (previous) => previous,
  });
}

export function useFollowUpKpisQuery() {
  return useQuery({
    queryKey: ["follow-ups", "kpis"],
    queryFn: ({ signal }) => getFollowUpKpis(signal),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow-ups"] }),
  });
}

export function useCancelFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelFollowUp(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow-ups"] }),
  });
}
