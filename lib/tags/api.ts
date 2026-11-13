import { apiClient } from "@/lib/api/api-client";
import type {
  TagEntity,
  TagEntityDisplay,
  TagItem,
  TagListQuery,
  TagListResult,
  TagPayload,
} from "@/types/tag";
import {
  INITIAL_DEFAULT_TAGS,
  filterTags,
  getTagAssociations,
  normalizeHexColor,
  normalizeTagEntity,
  removeDeletedTagAssociations,
  sortTags,
  toTagEntityEnum,
} from "./utils";

export {
  INITIAL_DEFAULT_TAGS,
  filterTags,
  getTagAssociations,
  normalizeHexColor,
  normalizeTagEntity,
  removeDeletedTagAssociations,
  sortTags,
  toTagEntityEnum,
};

const LOCAL_STORAGE_KEY = "hasvik_crm_tags_store_v1";

let memoryTags: TagItem[] = [...INITIAL_DEFAULT_TAGS];

function getStoredTags(): TagItem[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryTags = parsed;
          return memoryTags;
        }
      }
    } catch {
      // Fall through to memory
    }
  }
  return memoryTags;
}

function saveStoredTags(tags: TagItem[]): void {
  memoryTags = tags;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tags));
    } catch {
      // Ignore storage quota/security issues
    }
  }
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return Boolean(val && typeof val === "object" && !Array.isArray(val));
}

function parseTag(raw: unknown): TagItem {
  if (!isRecord(raw)) {
    throw new Error("Invalid tag record received");
  }
  const id = String(raw.id ?? raw._id ?? "");
  const name = String(raw.name ?? "");
  const color = normalizeHexColor(typeof raw.color === "string" ? raw.color : "#20B83F");
  const rawEntity = String(raw.entity ?? raw.entityType ?? "BUSINESS");
  const description = typeof raw.description === "string" ? raw.description : "";
  const leadsCount = typeof raw.leadsCount === "number" ? raw.leadsCount : undefined;
  const followUpsCount = typeof raw.followUpsCount === "number" ? raw.followUpsCount : undefined;
  const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : undefined;
  const updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : undefined;

  return {
    id,
    _id: id,
    name,
    color,
    entity: rawEntity,
    description,
    leadsCount,
    followUpsCount,
    createdAt,
    updatedAt,
  };
}

export async function getTags(
  query: TagListQuery = {},
  signal?: AbortSignal,
): Promise<TagListResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "asc";
  const search = query.search?.trim().toLowerCase() ?? "";
  const entityFilter = query.entity;

  try {
    const response = await apiClient.get("/tags", {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(search ? { search } : {}),
        ...(entityFilter && entityFilter !== "ALL"
          ? { entity: toTagEntityEnum(entityFilter) }
          : {}),
      },
      signal,
    });

    const data = response.data;
    let list: unknown[] | null = null;
    let total = 0;

    if (Array.isArray(data)) {
      list = data;
      total = data.length;
    } else if (isRecord(data)) {
      if (Array.isArray(data.items)) {
        list = data.items;
        total = typeof data.total === "number" ? data.total : data.items.length;
      } else if (Array.isArray(data.data)) {
        list = data.data;
        total = typeof data.total === "number" ? data.total : data.data.length;
      }
    }

    if (list && list.length > 0) {
      const items = list.map(parseTag);
      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    }
  } catch {
    // API not responding or returned error -> fall back smoothly to local/persisted items
  }

  // Local fallback
  let all = getStoredTags();
  all = filterTags(all, search, entityFilter);
  all = sortTags(all, sortBy, sortOrder);

  const total = all.length;
  const startIndex = (page - 1) * limit;
  const paginated = all.slice(startIndex, startIndex + limit);

  return {
    items: paginated,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function createTag(payload: TagPayload): Promise<TagItem> {
  const normalizedColor = normalizeHexColor(payload.color);
  const normalizedEntity = toTagEntityEnum(payload.entity);

  try {
    const response = await apiClient.post("/tags", {
      name: payload.name.trim(),
      color: normalizedColor,
      entity: normalizedEntity,
      description: payload.description?.trim() || "",
    });

    const parsed = parseTag(response.data?.data ?? response.data);
    if (parsed.id) {
      const current = getStoredTags();
      saveStoredTags([parsed, ...current]);
      return parsed;
    }
  } catch {
    // Continue with local creation
  }

  const newTag: TagItem = {
    id: `tag-${Date.now()}`,
    _id: `tag-${Date.now()}`,
    name: payload.name.trim(),
    color: normalizedColor,
    entity: normalizedEntity,
    description: payload.description?.trim() || "",
    leadsCount: 0,
    followUpsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const current = getStoredTags();
  saveStoredTags([newTag, ...current]);
  return newTag;
}

export async function updateTag(
  id: string,
  payload: Partial<TagPayload>,
): Promise<TagItem> {
  const updateData: Partial<TagItem> = {};
  if (payload.name !== undefined) updateData.name = payload.name.trim();
  if (payload.color !== undefined) updateData.color = normalizeHexColor(payload.color);
  if (payload.entity !== undefined) updateData.entity = toTagEntityEnum(payload.entity);
  if (payload.description !== undefined) updateData.description = payload.description.trim();
  updateData.updatedAt = new Date().toISOString();

  try {
    const response = await apiClient.put(`/tags/${id}`, updateData);
    const parsed = parseTag(response.data?.data ?? response.data);
    if (parsed.id) {
      const current = getStoredTags();
      const updated = current.map((t) => (t.id === id || t._id === id ? { ...t, ...parsed } : t));
      saveStoredTags(updated);
      return parsed;
    }
  } catch {
    // Local update fallback
  }

  const current = getStoredTags();
  let found: TagItem | null = null;
  const updated = current.map((t) => {
    if (t.id === id || t._id === id) {
      found = { ...t, ...updateData };
      return found;
    }
    return t;
  });

  if (!found) {
    throw new Error("Tag not found to update");
  }

  saveStoredTags(updated);
  return found;
}

export async function deleteTag(
  id: string,
): Promise<{ success: boolean; associationsCleaned: { businessesUpdated: number; followUpsUpdated: number } }> {
  const current = getStoredTags();
  const targetTag = current.find((t) => t.id === id || t._id === id);

  // 1. Remove deleted tag associations safely from all business and follow-up records
  const associationsCleaned = removeDeletedTagAssociations(id, targetTag?.name);

  // 2. Try remote API deletion
  try {
    await apiClient.delete(`/tags/${id}`);
  } catch {
    // Continue with local deletion fallback
  }

  // 3. Remove tag from tag list
  const filtered = current.filter((t) => t.id !== id && t._id !== id);
  saveStoredTags(filtered);

  return { success: true, associationsCleaned };
}
