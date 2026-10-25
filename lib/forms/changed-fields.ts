// Keep explicit clears (empty strings, null, false and empty arrays).
export function changedFields<T extends object>(values: T, original: object): Partial<T> {
  const baseline = original as Record<string, unknown>;
  return Object.fromEntries(Object.entries(values).filter(([key, value]) =>
    value !== undefined && JSON.stringify(value) !== JSON.stringify(baseline[key]),
  )) as Partial<T>;
}
