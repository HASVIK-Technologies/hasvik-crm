import type { LeadRecord } from "../analytics/types.ts";

/** Below these the forecast is not shown: it would imply a precision the data cannot support. */
export const MIN_MONTHS = 6;
export const MIN_CLOSED = 20;
const MAX_TREND_MONTHS = 12;

export interface MonthPoint {
  month: string; // YYYY-MM
  value: number;
}

export interface TrendPoint {
  month: string;
  low: number;
  expected: number;
  high: number;
}

export interface ForecastHistory {
  firstDate: string | null;
  months: number;
  won: number;
  lost: number;
  closed: number;
  open: number;
}

export interface ForecastResult {
  history: ForecastHistory;
  enough: boolean;
  /** Plain-language list of what is still missing, empty when `enough`. */
  needs: string[];
  /** Won / (won + lost) over the whole history; null with no closed leads. */
  winRate: number | null;
  /** Monthly count of leads that were won (by the month their record was last updated). */
  actual: MonthPoint[];
  weighted: {
    openLeads: number;
    /** Open leads x win rate. */
    expectedWins: number;
    byMonth: MonthPoint[];
    /** Open leads with no follow-up scheduled, so no expected close month. */
    unscheduled: number;
  };
  trend: TrendPoint[];
  method: "linear-trend";
  seasonality: boolean;
}

export interface ForecastOptions {
  now: Date;
  /** Months to project ahead (3 to 6). */
  horizon?: number;
  ownerId?: string;
}

const monthKey = (iso: string) => iso.slice(0, 7);

function addMonths(key: string, count: number): string {
  const [y, m] = key.split("-").map(Number);
  const index = y * 12 + (m - 1) + count;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

/** Ordinary least squares fit y = a + b x. */
export function linearFit(values: number[]): { a: number; b: number; sigma: number } {
  const n = values.length;
  if (n === 0) return { a: 0, b: 0, sigma: 0 };
  if (n === 1) return { a: values[0], b: 0, sigma: 0 };
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((s, v) => s + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  values.forEach((y, x) => {
    sxy += (x - meanX) * (y - meanY);
    sxx += (x - meanX) ** 2;
  });
  const b = sxx ? sxy / sxx : 0;
  const a = meanY - b * meanX;
  const sse = values.reduce((s, y, x) => s + (y - (a + b * x)) ** 2, 0);
  return { a, b, sigma: n > 2 ? Math.sqrt(sse / (n - 2)) : 0 };
}

/** Fills missing months with zero between the first and last month. */
function fillMonths(points: Map<string, number>, from: string, to: string): MonthPoint[] {
  const out: MonthPoint[] = [];
  for (let m = from; m <= to; m = addMonths(m, 1)) out.push({ month: m, value: points.get(m) ?? 0 });
  return out;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function buildForecast(allLeads: LeadRecord[], options: ForecastOptions): ForecastResult {
  const horizon = Math.min(6, Math.max(3, options.horizon ?? 6));
  const leads = allLeads.filter((lead) => lead.isActive && (!options.ownerId || lead.ownerId === options.ownerId));
  const currentMonth = options.now.toISOString().slice(0, 7);

  const won = leads.filter((l) => l.status === "WON");
  const lost = leads.filter((l) => l.status === "LOST");
  const open = leads.filter((l) => l.status !== "WON" && l.status !== "LOST");
  const created = leads.map((l) => l.createdAt).filter(Boolean).sort();
  const firstDate = created[0] ?? null;
  const months = firstDate ? Math.max(0, monthsBetween(monthKey(firstDate), currentMonth)) + 1 : 0;

  const history: ForecastHistory = { firstDate, months, won: won.length, lost: lost.length, closed: won.length + lost.length, open: open.length };

  const needs: string[] = [];
  if (months < MIN_MONTHS) needs.push(`at least ${MIN_MONTHS} months of history (there are ${months})`);
  if (history.closed < MIN_CLOSED) needs.push(`at least ${MIN_CLOSED} closed leads, won or lost (there are ${history.closed})`);
  const enough = needs.length === 0;

  const winRate = history.closed ? won.length / history.closed : null;

  // Monthly wins.
  const perMonth = new Map<string, number>();
  for (const lead of won) {
    const key = monthKey(lead.updatedAt || lead.createdAt);
    perMonth.set(key, (perMonth.get(key) ?? 0) + 1);
  }
  const actual = firstDate ? fillMonths(perMonth, monthKey(firstDate), currentMonth) : [];

  // Pipeline-weighted: open leads x overall win rate, by the month of their next scheduled follow-up.
  const rate = winRate ?? 0;
  const byMonthMap = new Map<string, number>();
  let unscheduled = 0;
  for (const lead of open) {
    if (!lead.nextFollowUpAt) { unscheduled++; continue; }
    const key = monthKey(lead.nextFollowUpAt);
    byMonthMap.set(key, (byMonthMap.get(key) ?? 0) + rate);
  }
  const byMonth = [...byMonthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ month, value: round1(value) }));

  // Trend: linear fit over the most recent complete months (the current month is partial and left out).
  const completed = actual.filter((p) => p.month < currentMonth).slice(-MAX_TREND_MONTHS);
  const fit = linearFit(completed.map((p) => p.value));
  const trend: TrendPoint[] = [];
  if (enough && completed.length >= 2) {
    for (let step = 1; step <= horizon; step++) {
      const x = completed.length - 1 + step;
      const expected = Math.max(0, fit.a + fit.b * x);
      // About an 80% band; it widens the further ahead the projection looks.
      const band = 1.28 * fit.sigma * Math.sqrt(1 + step / completed.length);
      trend.push({
        month: addMonths(completed[completed.length - 1].month, step),
        low: round1(Math.max(0, expected - band)),
        expected: round1(expected),
        high: round1(expected + band),
      });
    }
  }

  return {
    history,
    enough,
    needs,
    winRate: winRate === null ? null : Math.round(winRate * 1000) / 10,
    actual,
    weighted: { openLeads: open.length, expectedWins: round1(open.length * rate), byMonth, unscheduled },
    trend,
    method: "linear-trend",
    // Seasonality needs two full years of history; it is never applied until that exists and is built.
    seasonality: false,
  };
}

/** Expected wins landing in a calendar month key, from the weighted view. */
export function expectedIn(result: ForecastResult, months: string[]): number {
  return round1(result.weighted.byMonth.filter((p) => months.includes(p.month)).reduce((s, p) => s + p.value, 0));
}
