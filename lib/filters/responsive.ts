export function visibleFilterCount(width: number, maxDesktop = 3) {
  if (width >= 1280) return maxDesktop;
  if (width >= 1024) return Math.min(2, maxDesktop);
  return 0;
}

export function splitFilters<T>(fields: T[], count: number) {
  return { visible: fields.slice(0, count), more: fields.slice(count) };
}