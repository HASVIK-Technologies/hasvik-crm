"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Info, Scale, Target, TrendingUp, Trophy } from "lucide-react";
import ChartFrame from "@/components/common/ChartFrame";
import FilterSelect from "@/components/common/FilterSelect";
import KpiCards from "@/components/common/KpiCards";
import { Card } from "@/components/ui/card";
import { useLeadsData } from "@/hooks/use-analytics";
import TrendChart from "@/components/common/TrendChart";
import { formatDay, formatMonth } from "@/lib/analytics/format";
import { leadsHref } from "@/lib/analytics/lead-filters";
import { startOfDay } from "@/lib/analytics/ranges";
import { buildForecast, expectedIn, MIN_CLOSED, MIN_MONTHS } from "@/lib/forecast/model";
import { useAuthStore } from "@/store/auth-store";

function monthWindow(month: string) {
  const from = new Date(startOfDay(`${month}-01`)).toISOString();
  const [y, m] = month.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return { from, to: new Date(startOfDay(next) - 1).toISOString() };
}

export default function ForecastView() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const leadsQuery = useLeadsData();
  const [owner, setOwner] = useState("");
  const [horizon, setHorizon] = useState("6");
  const [now] = useState(() => new Date());

  const leads = useMemo(() => leadsQuery.data ?? [], [leadsQuery.data]);
  const owners = useMemo(() => {
    const seen = new Map<string, string>();
    for (const lead of leads) if (lead.ownerId) seen.set(lead.ownerId, lead.ownerName || "Unnamed user");
    return [...seen.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [leads]);

  const result = useMemo(() => buildForecast(leads, { now, ownerId: owner || undefined, horizon: Number(horizon) }), [leads, now, owner, horizon]);

  const thisMonth = now.toISOString().slice(0, 7);
  const [y, m] = thisMonth.split("-").map(Number);
  const quarter = [0, 1, 2].map((i) => { const idx = y * 12 + Math.floor((m - 1) / 3) * 3 + i; return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, "0")}`; });
  const ownerFilter = owner ? { owner } : {};
  const monthLink = (months: string[]) => {
    const first = monthWindow(months[0]);
    const last = monthWindow(months[months.length - 1]);
    return leadsHref({ open: true, isActive: true, nextFrom: first.from, nextTo: last.to, ...ownerFilter });
  };

  const failed = leadsQuery.isError;
  const loading = leadsQuery.isPending;
  const { history } = result;

  return (
    <div className="space-y-5">
      <div className="fade-up flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">
            Forecast
            <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-xs font-semibold tracking-wide text-warn uppercase">Estimate</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">A decision aid built from your own lead history. It shows lead counts, not revenue, because leads carry no deal value in this system.</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
          <FilterSelect label="Owner" value={owner} onChange={setOwner} options={[{ value: "", label: user?.role === "SALES" ? "Everyone I can see" : "Whole team" }, ...owners]} />
          <FilterSelect label="Look ahead" value={horizon} onChange={setHorizon} options={[3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} months` }))} />
        </div>
      </div>

      {failed && <div role="alert" className="rounded-2xl border border-warn/30 bg-warn-soft p-4 text-sm text-warn">We couldn&apos;t load your lead history. Check your connection and refresh the page.</div>}

      <Card className="gap-2 p-4 sm:p-5">
        <h2 className="text-base font-bold tracking-tight text-ink">The history this is based on</h2>
        {loading ? <div className="skeleton h-12" /> : (
          <p className="text-sm leading-relaxed text-ink-soft tabular">
            {history.firstDate ? <>Leads go back to <strong className="text-ink">{formatDay(history.firstDate)}</strong>, about <strong className="text-ink">{history.months} month{history.months === 1 ? "" : "s"}</strong>. </> : "There are no leads yet. "}
            <strong className="text-ink">{history.won}</strong> won, <strong className="text-ink">{history.lost}</strong> lost, <strong className="text-ink">{history.open}</strong> still open.
          </p>
        )}
      </Card>

      {!loading && !failed && !result.enough && (
        <Card className="items-center gap-3 p-8 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-strong"><TrendingUp className="size-7" aria-hidden /></span>
          <h2 className="text-lg font-bold text-ink">Not enough data yet</h2>
          <p className="max-w-md text-sm text-muted">A forecast from this little history would look precise without being reliable, so it is switched off. It turns on once there are:</p>
          <ul className="space-y-1 text-sm font-semibold text-ink">
            <li>At least {MIN_MONTHS} months of lead history</li>
            <li>At least {MIN_CLOSED} closed leads (won or lost)</li>
          </ul>
          <p className="text-sm text-muted">Right now: {result.needs.join(", and ")}.</p>
        </Card>
      )}

      {!loading && !failed && result.enough && (
        <>
          <KpiCards
            items={[
              { label: "Expected this month", value: expectedIn(result, [thisMonth]), count: expectedIn(result, [thisMonth]), icon: Target, tone: "blue", hint: "Expected wins from open leads due this month", href: monthLink([thisMonth]) },
              { label: "Expected this quarter", value: expectedIn(result, quarter), count: expectedIn(result, quarter), icon: Target, tone: "blue", hint: "Same, for the quarter", href: monthLink(quarter) },
              { label: "Weighted pipeline", value: result.weighted.expectedWins, count: result.weighted.expectedWins, icon: Scale, tone: "green", hint: `${result.weighted.openLeads} open leads x win rate`, href: leadsHref({ open: true, isActive: true, ...ownerFilter }) },
              { label: "Win rate used", value: `${result.winRate}%`, count: history.closed, icon: Trophy, tone: "slate", hint: `From ${history.closed} closed leads`, href: "/reports/win-loss" },
            ]}
          />

          <ChartFrame
            title="Wins per month: actual and expected"
            description={`Next ${horizon} months, shown as a range. Tap a point to open the leads behind it.`}
            table={{ columns: ["Month", "Actual", "Low", "Expected", "High"], rows: [...result.actual.map((p) => [formatMonth(p.month), p.value, "", "", ""]), ...result.trend.map((p) => [formatMonth(p.month), "", p.low, p.expected, p.high])] }}
          >
            <TrendChart
              ariaLabel="Leads won per month, with expected wins and a low to high range"
              unit="wins"
              actual={result.actual.map((p) => ({ key: p.month, label: p.month, value: p.value }))}
              forecast={result.trend.map((p) => ({ key: p.month, label: p.month, low: p.low, expected: p.expected, high: p.high }))}
              onSelect={(month, kind) => {
                const w = monthWindow(month);
                router.push(kind === "actual"
                  ? leadsHref({ status: "WON", updatedFrom: w.from, updatedTo: w.to, isActive: true, ...ownerFilter })
                  : leadsHref({ open: true, nextFrom: w.from, nextTo: w.to, isActive: true, ...ownerFilter }));
              }}
            />
          </ChartFrame>
        </>
      )}

      <Card className="gap-3 p-4 sm:p-5">
        <details open={!result.enough}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-base font-bold tracking-tight text-ink"><Info className="size-5 text-brand-strong" aria-hidden />How this is calculated</summary>
          <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-soft">
            <p><strong className="text-ink">Win rate.</strong> Leads marked Won divided by leads marked Won or Lost, across the whole history{result.winRate !== null ? ` (${result.winRate}% from ${history.closed} closed leads)` : ""}. The system keeps no record of which stage a lead was in when it closed, so one overall rate is used for every open lead.</p>
            <p><strong className="text-ink">Weighted pipeline.</strong> Each open lead counts as the win rate (for example 0.4 of a win), placed in the month of its next scheduled follow-up. Open leads with no follow-up scheduled ({result.weighted.unscheduled}) have no expected month and are left out of the monthly figures.</p>
            <p><strong className="text-ink">Trend.</strong> A straight line fitted to wins per month over the last 12 complete months, continued forward. The shaded band is roughly an 80% range based on how far past months moved from that line, and it widens further out. Seasonality is not used because it needs two full years of history.</p>
            <p><strong className="text-ink">Limits.</strong> A lead counts as won in the month its record was last updated. Estimates assume the future resembles the past. Your data never leaves this system.</p>
          </div>
        </details>
      </Card>
    </div>
  );
}
