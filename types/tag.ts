export type TagEntity = "BUSINESS" | "FOLLOW_UP";
export type TagEntityDisplay = "Business" | "Follow-up";

export interface TagItem {
  id: string;
  _id?: string;
  name: string;
  color: string;
  entity: TagEntity | TagEntityDisplay | string;
  description?: string;
  leadsCount?: number;
  followUpsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AssignedTag = Pick<TagItem, "id" | "name" | "color">;

export function normalizeAssignedTags(value: unknown): AssignedTag[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Record<string, unknown>;
    const id = String(raw.id ?? raw._id ?? raw.tagId ?? "");
    const name = String(raw.name ?? "");
    const color = String(raw.color ?? "");
    return id && name && color ? [{ id, name, color }] : [];
  });
}

export interface TagPayload {
  name: string;
  color: string;
  entity: TagEntity | TagEntityDisplay;
  description?: string;
}

export interface TagListQuery {
  search?: string;
  entity?: "ALL" | TagEntity | TagEntityDisplay;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TagListResult {
  items: TagItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TagAutocompleteQuery {
  search?: string;
  entityType: "BUSINESS" | "FOLLOWUP";
  limit?: number;
}

