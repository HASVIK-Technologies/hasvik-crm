export function visibleFilterCount(width: number) {
  if (width >= 1280) return 3;
  if (width >= 1024) return 2;
  return 0;
}

export function splitFilters<T>(fields: T[], count: number) {
  return { visible: fields.slice(0, count), more: fields.slice(count) };
}
