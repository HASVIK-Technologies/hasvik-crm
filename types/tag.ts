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

