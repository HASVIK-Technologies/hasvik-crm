export function normalizeHttpUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidHttpUrl(value: string): boolean {
  const normalized = normalizeHttpUrl(value);
  if (!normalized) return true;

  try {
    const url = new URL(normalized);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      (url.hostname === "localhost" || url.hostname.includes("."))
    );
  } catch {
    return false;
  }
}

export function isValidOptionalEmail(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}
