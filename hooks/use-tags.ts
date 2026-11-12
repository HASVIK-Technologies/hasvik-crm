"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTag, deleteTag, getTags, updateTag } from "@/lib/tags/api";
import type { TagEntity, TagEntityDisplay, TagListQuery, TagPayload } from "@/types/tag";
import { getApiErrorMessage } from "@/lib/api/api-error";

export const tagQueryKeys = {
  all: ["tags-management"] as const,
  list: (query: TagListQuery) => [...tagQueryKeys.all, "list", query] as const,
};

export function useTagsQuery(query: TagListQuery) {
  return useQuery({
    queryKey: tagQueryKeys.list(query),
    queryFn: ({ signal }) => getTags(query, signal),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TagPayload) => createTag(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
      toast.success(`Tag "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error) || "Failed to create tag");
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TagPayload> }) =>
      updateTag(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
      toast.success(`Tag "${data.name}" updated successfully`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error) || "Failed to update tag");
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.all });
      toast.success("Tag deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error) || "Failed to delete tag");
    },
  });
}
