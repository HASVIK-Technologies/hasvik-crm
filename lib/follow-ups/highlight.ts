export function savedFollowUpDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function visibleCalendarItems<T extends { id: string }>(items: T[], highlightedId?: string | null): T[] {
  const visible = items.slice(0, 3);
  const highlighted = items.find((item) => item.id === highlightedId);
  if (highlighted && !visible.some((item) => item.id === highlightedId)) visible[2] = highlighted;
  return visible;
}
