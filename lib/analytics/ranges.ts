import { DASHBOARD_TIME_ZONE } from "../dashboard/model.ts";
import type { DateRange, RangePreset } from "./types.ts";

const DAY = 86_400_000;
// The workspace works in India Standard Time (fixed +05:30, no daylight saving).
const OFFSET = "+05:30";

/** Calendar date (YYYY-MM-DD) of an instant in the workspace time zone. */
export function zonedDay(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: DASHBOARD_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export const startOfDay = (day: string) => new Date(`${day}T00:00:00${OFFSET}`).getTime();
export const endOfDay = (day: string) => startOfDay(day) + DAY - 1;

function shiftMonth(day: string, months: number): string {
  const [y, m] = day.split("-").map(Number);
  const index = y * 12 + (m - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

const iso = (ms: number) => new Date(ms).toISOString();

export const PRESET_LABELS: Record<RangePreset, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  month: "This month",
  quarter: "This quarter",
  custom: "Custom",
};

/** Resolve a preset (or custom day pair) into an inclusive range plus its comparison period. */
export function resolveRange(preset: RangePreset, now: Date, custom?: { from: string; to: string }): DateRange {
  const today = zonedDay(now);
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const trailing = (days: number, label: string): DateRange => {
    const from = todayStart - (days - 1) * DAY;
    return {
      preset,
      from: iso(from),
      to: iso(todayEnd),
      previous: { from: iso(from - days * DAY), to: iso(from - 1) },
      label,
      compareLabel: days === 1 ? "vs yesterday" : `vs previous ${days} days`,
    };
  };

  if (preset === "today") return trailing(1, "Today");
  if (preset === "7d") return trailing(7, "Last 7 days");
  if (preset === "30d") return trailing(30, "Last 30 days");

  if (preset === "month" || preset === "quarter") {
    const [y, m] = today.split("-").map(Number);
    const span = preset === "month" ? 1 : 3;
    const firstMonth = preset === "month" ? m : Math.floor((m - 1) / 3) * 3 + 1;
    const startDay = `${y}-${String(firstMonth).padStart(2, "0")}-01`;
    const prevStartDay = shiftMonth(startDay, -span);
    return {
      preset,
      from: iso(startOfDay(startDay)),
      to: iso(todayEnd),
      previous: { from: iso(startOfDay(prevStartDay)), to: iso(startOfDay(startDay) - 1) },
      label: preset === "month" ? "This month" : "This quarter",
      compareLabel: preset === "month" ? "vs last month" : "vs last quarter",
    };
  }

  const fromDay = custom?.from && /^\d{4}-\d{2}-\d{2}$/.test(custom.from) ? custom.from : today;
  const toDay = custom?.to && /^\d{4}-\d{2}-\d{2}$/.test(custom.to) ? custom.to : today;
  const [a, b] = fromDay <= toDay ? [fromDay, toDay] : [toDay, fromDay];
  const from = startOfDay(a);
  const to = endOfDay(b);
  const length = to - from + 1;
  return {
    preset: "custom",
    from: iso(from),
    to: iso(to),
    previous: { from: iso(from - length), to: iso(from - 1) },
    label: a === b ? a : `${a} to ${b}`,
    compareLabel: "vs the period before",
  };
}

export function inRange(value: string | undefined, from: string, to: string): boolean {
  if (!value) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time >= Date.parse(from) && time <= Date.parse(to);
}

/** Percentage change from `previous` to `current`, rounded; null when there is no earlier figure to compare to. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}
