const ZONE = "Asia/Kolkata";

const dayFormat = new Intl.DateTimeFormat("en-IN", { timeZone: ZONE, day: "numeric", month: "short", year: "numeric" });
const shortFormat = new Intl.DateTimeFormat("en-IN", { timeZone: ZONE, day: "numeric", month: "short" });
const timeFormat = new Intl.DateTimeFormat("en-IN", { timeZone: ZONE, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const numberFormat = new Intl.NumberFormat("en-IN");
const monthFormat = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "short", year: "numeric" });

const valid = (iso?: string) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso) : null);

export const formatDay = (iso?: string) => { const d = valid(iso); return d ? dayFormat.format(d) : "No date"; };
export const formatShortDay = (iso?: string) => { const d = valid(iso); return d ? shortFormat.format(d) : "No date"; };
export const formatDateTime = (iso?: string) => { const d = valid(iso); return d ? timeFormat.format(d) : "No date"; };
export const formatNumber = (value: number) => numberFormat.format(value);

/** "2026-10" -> "Oct 2026". */
export function formatMonth(key: string) {
  const d = valid(`${key}-01T00:00:00Z`);
  return d ? monthFormat.format(d) : key;
}

/** Whole days between two instants, never negative. */
export const daysBetween = (from: string, to: Date) => Math.max(0, Math.floor((to.getTime() - Date.parse(from)) / 86_400_000));

export function greeting(now: Date): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, hour: "numeric", hour12: false }).format(now));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}
