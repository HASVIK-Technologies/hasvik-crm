import type {
  TagEntity,
  TagEntityDisplay,
  TagItem,
} from "../../types/tag.ts";

export const INITIAL_DEFAULT_TAGS: TagItem[] = [
  {
    id: "tag-1",
    name: "Hot Lead",
    color: "#20B83F",
    entity: "BUSINESS",
    description: "High priority business leads, ready for immediate follow-up.",
    leadsCount: 14,
    followUpsCount: 5,
    createdAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "tag-2",
    name: "Proposal Sent",
    color: "#0876D1",
    entity: "BUSINESS",
    description: "Proposal has been shared with the business.",
    leadsCount: 8,
    followUpsCount: 2,
    createdAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "tag-3",
    name: "Follow-up Today",
    color: "#63D329",
    entity: "FOLLOW_UP",
    description: "Follow-ups scheduled for today.",
    leadsCount: 0,
    followUpsCount: 12,
    createdAt: "2026-10-03T10:00:00.000Z",
  },
  {
    id: "tag-4",
    name: "Demo",
    color: "#FFA500",
    entity: "BUSINESS",
    description: "Demo has been given to the lead.",
    leadsCount: 6,
    followUpsCount: 3,
    createdAt: "2026-10-04T10:00:00.000Z",
  },
  {
    id: "tag-5",
    name: "Not Interested",
    color: "#EF4444",
    entity: "BUSINESS",
    description: "Lead has shown no interest at this time.",
    leadsCount: 4,
    followUpsCount: 0,
    createdAt: "2026-10-05T10:00:00.000Z",
  },
  {
    id: "tag-6",
    name: "Renewal",
    color: "#8B5CF6",
    entity: "FOLLOW_UP",
    description: "Follow-up for renewal or contract extension.",
    leadsCount: 0,
    followUpsCount: 9,
    createdAt: "2026-10-06T10:00:00.000Z",
  },
  {
    id: "tag-7",
    name: "Long Term",
    color: "#08A9E6",
    entity: "BUSINESS",
    description: "Potential for future business (3+ months).",
    leadsCount: 7,
    followUpsCount: 1,
    createdAt: "2026-10-07T10:00:00.000Z",
  },
  {
    id: "tag-8",
    name: "Closed Won",
    color: "#6B7280",
    entity: "BUSINESS",
    description: "Business converted into a customer.",
    leadsCount: 11,
    followUpsCount: 0,
    createdAt: "2026-10-08T10:00:00.000Z",
  },
];

export function normalizeTagEntity(entity?: string): TagEntityDisplay {
  if (!entity) return "Business";
  const upper = entity.toUpperCase();
  if (upper.includes("FOLLOW")) {
    return "Follow-up";
  }
  return "Business";
}

export function toTagEntityEnum(entity?: string): TagEntity {
  if (!entity) return "BUSINESS";
  const upper = entity.toUpperCase();
  if (upper.includes("FOLLOW")) {
    return "FOLLOW_UP";
  }
  return "BUSINESS";
}

export function normalizeHexColor(color?: string): string {
  if (!color) return "#20B83F";
  const trimmed = color.trim().toUpperCase();
  if (trimmed.startsWith("#")) return trimmed;
  return `#${trimmed}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num) || cleanHex.length !== 6) {
    return `rgba(32, 184, 63, ${alpha})`;
  }
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function filterTags(
  tags: TagItem[],
  search?: string,
  entityFilter?: "ALL" | TagEntity | string,
): TagItem[] {
  let filtered = [...tags];
  if (search?.trim()) {
    const s = search.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(s) ||
        (item.description && item.description.toLowerCase().includes(s)),
    );
  }

  if (entityFilter && entityFilter !== "ALL") {
    const targetEnum = toTagEntityEnum(entityFilter);
    filtered = filtered.filter((item) => toTagEntityEnum(item.entity) === targetEnum);
  }

  return filtered;
}

export function sortTags(
  tags: TagItem[],
  sortBy: string = "name",
  sortOrder: "asc" | "desc" = "asc",
): TagItem[] {
  const sorted = [...tags];
  sorted.sort((a, b) => {
    let comp = 0;
    if (sortBy === "name") {
      comp = a.name.localeCompare(b.name);
    } else if (sortBy === "entity") {
      comp = normalizeTagEntity(a.entity).localeCompare(normalizeTagEntity(b.entity));
    } else {
      comp = (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
    }
    return sortOrder === "asc" ? comp : -comp;
  });
  return sorted;
}

export function getTagAssociations(tag?: TagItem | null): {
  leadsCount: number;
  followUpsCount: number;
  total: number;
} {
  if (!tag) return { leadsCount: 0, followUpsCount: 0, total: 0 };
  const leadsCount = typeof tag.leadsCount === "number" ? Math.max(0, tag.leadsCount) : 0;
  const followUpsCount =
    typeof tag.followUpsCount === "number" ? Math.max(0, tag.followUpsCount) : 0;
  return {
    leadsCount,
    followUpsCount,
    total: leadsCount + followUpsCount,
  };
}

/**
 * Safely removes tag associations from any business leads and follow-up records.
 * Crucially, this removes the tag assignment while leaving all business and
 * follow-up records completely intact!
 */
export function removeDeletedTagAssociations(
  tagId: string,
  tagName?: string,
): { businessesUpdated: number; followUpsUpdated: number } {
  let businessesUpdated = 0;
  let followUpsUpdated = 0;

  if (typeof window === "undefined") {
    return { businessesUpdated, followUpsUpdated };
  }

  try {
    // 1. Check local businesses store if present
    const businessKeys = ["hasvik_crm_businesses", "crm_businesses_cache"];
    for (const key of businessKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          let modified = false;
          const updatedList = list.map((record) => {
            if (!record || typeof record !== "object") return record;
            let recordModified = false;
            const updated = { ...record };

            if (Array.isArray(updated.tags)) {
              const prevLen = updated.tags.length;
              updated.tags = updated.tags.filter(
                (t: unknown) =>
                  t !== tagId &&
                  t !== tagName &&
                  (typeof t !== "object" || (t as { id?: string; name?: string })?.id !== tagId),
              );
              if (updated.tags.length !== prevLen) {
                recordModified = true;
              }
            }

            if (Array.isArray(updated.tagIds)) {
              const prevLen = updated.tagIds.length;
              updated.tagIds = updated.tagIds.filter((id: unknown) => id !== tagId);
              if (updated.tagIds.length !== prevLen) {
                recordModified = true;
              }
            }

            if (recordModified) {
              businessesUpdated += 1;
              modified = true;
            }
            return updated;
          });

          if (modified) {
            localStorage.setItem(key, JSON.stringify(updatedList));
          }
        }
      }
    }

    // 2. Check local follow-ups store if present
    const followUpKeys = ["hasvik_crm_follow_ups", "crm_follow_ups_cache"];
    for (const key of followUpKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          let modified = false;
          const updatedList = list.map((record) => {
            if (!record || typeof record !== "object") return record;
            let recordModified = false;
            const updated = { ...record };

            if (Array.isArray(updated.tags)) {
              const prevLen = updated.tags.length;
              updated.tags = updated.tags.filter(
                (t: unknown) =>
                  t !== tagId &&
                  t !== tagName &&
                  (typeof t !== "object" || (t as { id?: string; name?: string })?.id !== tagId),
              );
              if (updated.tags.length !== prevLen) {
                recordModified = true;
              }
            }

            if (Array.isArray(updated.tagIds)) {
              const prevLen = updated.tagIds.length;
              updated.tagIds = updated.tagIds.filter((id: unknown) => id !== tagId);
              if (updated.tagIds.length !== prevLen) {
                recordModified = true;
              }
            }

            if (recordModified) {
              followUpsUpdated += 1;
              modified = true;
            }
            return updated;
          });

          if (modified) {
            localStorage.setItem(key, JSON.stringify(updatedList));
          }
        }
      }
    }
  } catch {
    // Ignore storage parsing errors
  }

  return { businessesUpdated, followUpsUpdated };
}
