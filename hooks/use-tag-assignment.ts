"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/api-client";
import { getTagAutocomplete } from "@/lib/tags/api";
import { businessQueryKeys, followUpQueryKeys } from "@/lib/query/query-keys";
import type { AssignedTag, TagEntity } from "@/types/tag";

type Assignment = { entity: TagEntity; entityId: string; tagIds: string[] };

function normalizeTags(raw: unknown, ids: string[], catalog: AssignedTag[]): AssignedTag[] {
  const values = Array.isArray(raw) ? raw : ids;
  return values.flatMap((item) => {
    if (typeof item === "string") {
      const fromCatalog = catalog.find((tag) => tag.id === item);
      return fromCatalog ? [fromCatalog] : [];
    }
    if (item && typeof item === "object") {
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? row._id ?? row.tagId ?? "");
      if (!id) return [];
      const fromCatalog = catalog.find((tag) => tag.id === id);
      if (!fromCatalog && (!row.name || !row.color)) return [];
      return [{ id, name: String(row.name ?? fromCatalog?.name ?? "Tag"), color: String(row.color ?? fromCatalog?.color ?? "#64748b") }];
    }
    return [];
  });
}

export function useAssignTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entity, entityId, tagIds }: Assignment) => {
      const path = entity === "BUSINESS" ? `/businesses/${entityId}` : `/follow-ups/${entityId}`;
      const response = await apiClient.patch(path, { tagIds });
      const body = response.data as Record<string, unknown>;
      const data = body?.data && typeof body.data === "object" ? body.data as Record<string, unknown> : body;
      const record = data?.business && typeof data.business === "object"
        ? data.business as Record<string, unknown>
        : data;
      return { entity, entityId, tagIds, record, tags: record?.tags };
    },
    onSuccess: async ({ entity, entityId, tagIds, record, tags }) => {
      const catalog = queryClient.getQueriesData<{ items?: AssignedTag[] } | AssignedTag[]>({ queryKey: ["tags-management"] }).flatMap(([, data]) => Array.isArray(data) ? data : data?.items ?? []);
      let nextTags = normalizeTags(tags, tagIds, catalog);
      if (entity === "FOLLOW_UP") {
        const returnedIds = Array.isArray(tags) ? tags.map((tag) => typeof tag === "string" ? tag : String((tag as Record<string, unknown>)?._id ?? (tag as Record<string, unknown>)?.id ?? "")).filter(Boolean) : tagIds;
        const missingIds = returnedIds.filter((id) => !nextTags.some((tag) => tag.id === id));
        if (missingIds.length) {
          const resolved = await getTagAutocomplete({ entityType: "FOLLOWUP", search: "", limit: 100 });
          const byId = new Map([...catalog, ...resolved].map((tag) => [tag.id, tag]));
          nextTags = returnedIds.flatMap((id) => { const tag = byId.get(id); return tag ? [tag] : []; });
        }
      }
      if (entity === "BUSINESS") {
        const updatedBusiness = record ? { ...record, tags: nextTags } : { tags: nextTags };
        queryClient.setQueriesData({ queryKey: businessQueryKeys.lists() }, (old: unknown) => {
          const data = old as { businesses?: Array<Record<string, unknown>> } | undefined;
          return data?.businesses ? { ...data, businesses: data.businesses.map((item) => String(item.id) === entityId ? { ...item, ...updatedBusiness, id: item.id, tags: nextTags } : item) } : old;
        });
        queryClient.setQueryData(businessQueryKeys.detail(entityId), (old: unknown) => old && typeof old === "object" ? { ...old, ...updatedBusiness, id: entityId, tags: nextTags } : old);
      } else {
        // The follow-up endpoint returns tag IDs. Resolve them from the already
        // cached autocomplete results while retaining the confirmed response IDs.
        queryClient.setQueriesData({ queryKey: followUpQueryKeys.lists() }, (old: unknown) => {
          const data = old as { items?: Array<Record<string, unknown>> } | undefined;
          return data?.items ? { ...data, items: data.items.map((item) => String(item.id) === entityId ? { ...item, tags: nextTags, tagIds } : item) } : old;
        });
        queryClient.setQueryData(followUpQueryKeys.detail(entityId), (old: unknown) => old && typeof old === "object" ? { ...old, tags: nextTags, tagIds } : old);
      }
      toast.success("Tags updated.");
    },
    onError: () => toast.error("Failed to update tags. Your changes were not saved."),
  });
}
