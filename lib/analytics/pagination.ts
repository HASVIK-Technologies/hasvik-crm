type Raw = Record<string, unknown>;

const rec = (value: unknown): Raw => (value && typeof value === "object" ? (value as Raw) : {});

export function pageFromResponse(payload: unknown): { rows: unknown[]; total?: number } {
  if (Array.isArray(payload)) return { rows: payload };
  const root = rec(payload);
  const nested = rec(root.data);
  const rows = Array.isArray(root.data)
    ? root.data
    : Array.isArray(nested.data)
      ? nested.data
      : undefined;
  if (!rows) throw new Error("The analytics service returned an invalid paginated response.");

  const rawTotal = root.total ?? nested.total;
  if (rawTotal === undefined) return { rows };
  if (typeof rawTotal !== "number" || !Number.isSafeInteger(rawTotal) || rawTotal < 0) {
    throw new Error("The analytics service returned an invalid result total.");
  }
  return { rows, total: rawTotal };
}
