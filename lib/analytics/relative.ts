import { startOfDay, zonedDay } from "./ranges.ts";

const DAY = 86_400_000;

export type RelativeTone = "bad" | "warn" | "brand" | "muted";

export interface RelativeDay {
  /** "Today", "Tomorrow", "In 3 days", "Overdue 5d". */
  label: string;
  tone: RelativeTone;
  /** Whole calendar days from today in the workspace time zone; negative when in the past. */
  days: number;
}

/** A due date as a short, friendly chip. Null when the value is empty or not a date. */
export function relativeDay(value: string | undefined, now: Date): RelativeDay | null {
  if (!value) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  const days = Math.round((startOfDay(zonedDay(new Date(time))) - startOfDay(zonedDay(now))) / DAY);
  if (days < 0) return { label: `Overdue ${Math.abs(days)}d`, tone: "bad", days };
  if (days === 0) return { label: "Today", tone: "warn", days };
  if (days === 1) return { label: "Tomorrow", tone: "brand", days };
  return { label: `In ${days} days`, tone: "muted", days };
}

/** Exact local date and time for a tooltip. */
export function exactTime(value: string): string {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "";
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(new Date(time));
}

/** "2 hours ago", "3 days ago": for recent activity feeds. */
export function timeAgo(value: string | undefined, now: Date): string {
  if (!value) return "";
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "";
  const seconds = Math.max(0, Math.round((now.getTime() - time) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(new Date(time));
}

