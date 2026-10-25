export function isRecordInactive(record?: { isActive?: boolean; status?: string } | null): boolean {
  return record?.isActive === false || record?.status?.toUpperCase() === "INACTIVE";
}

export function canUpdateRecord(record: { isActive?: boolean; status?: string }, updates: Record<string, unknown>): boolean {
  return !isRecordInactive(record) || (updates.isActive === true && Object.keys(updates).length === 1);
}
