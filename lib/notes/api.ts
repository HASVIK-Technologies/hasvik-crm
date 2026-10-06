import { apiClient } from "@/lib/api/api-client";
import type { FollowUpNote, FollowUpNotesPage } from "@/types/follow-up";

const NOTES_PAGE_SIZE = 10;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseNote(value: unknown): FollowUpNote {
  if (!isRecord(value)) {
    throw new Error("The notes service returned an invalid note.");
  }

  const id = String(value._id ?? value.id ?? value.noteId ?? "");
  const entityType = value.entityType ?? "FOLLOW_UP";
  const entityRecord = isRecord(value.entity) ? value.entity : undefined;
  const entityId = String(
    value.entityId ?? entityRecord?._id ?? entityRecord?.id ?? "",
  );
  const content = value.content;
  const createdByValue = value.createdBy;
  const createdByRecord = isRecord(createdByValue) ? createdByValue : undefined;
  const createdBy =
    typeof createdByValue === "string"
      ? createdByValue
      : String(
          createdByRecord?._id ??
            createdByRecord?.id ??
            createdByRecord?.userId ??
            "",
        );
  const createdByName = createdByRecord
    ? String(
        createdByRecord.fullName ??
          createdByRecord.name ??
          createdByRecord.email ??
          "",
      ) || undefined
    : undefined;
  const createdAt = value.createdAt ?? value.created_at ?? "";
  const updatedAt = value.updatedAt ?? value.updated_at ?? createdAt;

  if (
    !id ||
    (entityType !== "BUSINESS" && entityType !== "FOLLOW_UP") ||
    !entityId ||
    typeof content !== "string"
  ) {
    throw new Error("The notes service returned an invalid note.");
  }

  return {
    id,
    entityType,
    entityId,
    content,
    createdBy,
    createdByName,
    createdAt: String(createdAt),
    updatedAt: String(updatedAt),
  };
}

function findNotes(value: unknown, depth = 0): unknown[] | undefined {
  if (Array.isArray(value)) return value;
  if (!isRecord(value) || depth > 4) return undefined;

  for (const key of ["notes", "items", "results", "data"]) {
    const nested = value[key];
    if (Array.isArray(nested)) return nested;
    const found = findNotes(nested, depth + 1);
    if (found) return found;
  }

  return undefined;
}

function findNumber(
  sources: Array<Record<string, unknown> | undefined>,
  keys: string[],
): number | undefined {
  for (const source of sources) {
    for (const key of keys) {
      const value = source?.[key];
      const parsed =
        typeof value === "number" || typeof value === "string"
          ? Number(value)
          : NaN;
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
  }
  return undefined;
}

export async function getFollowUpNotes(
  followUpId: string,
  page: number,
  signal?: AbortSignal,
): Promise<FollowUpNotesPage> {
  const response = await apiClient.get("/notes", {
    params: {
      entityType: "FOLLOW_UP",
      entityId: followUpId,
      page,
      limit: NOTES_PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    signal,
  });

  const root = isRecord(response.data) ? response.data : undefined;
  const rows = findNotes(response.data);

  if (!rows) {
    throw new Error("The notes service returned an invalid notes list.");
  }

  const items = rows
    .map((item) => {
      try {
        return parseNote(item);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Unable to read a follow-up note: ${error.message}`);
        }
        throw error;
      }
    })
    .filter((note) => note.entityType === "FOLLOW_UP" && note.entityId === followUpId);
  const payload = isRecord(root?.data) ? root.data : undefined;
  const metadata = isRecord(root?.meta)
    ? root.meta
    : isRecord(payload?.meta)
      ? payload.meta
      : isRecord(root?.pagination)
        ? root.pagination
        : isRecord(payload?.pagination)
          ? payload.pagination
          : undefined;
  const total =
    findNumber([root, payload, metadata], ["total", "totalCount", "count"]) ??
    items.length;
  const totalPages =
    findNumber([root, payload, metadata], ["totalPages", "pages"]) ??
    Math.ceil(total / NOTES_PAGE_SIZE);

  return {
    items,
    page:
      findNumber([root, payload, metadata], ["page", "currentPage"]) ?? page,
    limit:
      findNumber([root, payload, metadata], ["limit", "pageSize"]) ??
      NOTES_PAGE_SIZE,
    total,
    totalPages: totalPages > 0 ? totalPages : undefined,
  };
}

export async function createFollowUpNote(
  followUpId: string,
  content: string,
): Promise<FollowUpNote> {
  const response = await apiClient.post("/notes", {
    entityType: "FOLLOW_UP",
    entityId: followUpId,
    content,
  });

  let payload: unknown = response.data;
  for (let depth = 0; depth < 4 && isRecord(payload); depth += 1) {
    const wrapped = payload.note ?? payload.data;
    if (wrapped === undefined) break;
    payload = wrapped;
  }
  return parseNote(payload);
}
