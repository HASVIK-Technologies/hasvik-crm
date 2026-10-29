"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Download, FileSpreadsheet, Printer, SlidersHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import ActiveFilterChips, { type FilterChip } from "@/components/common/ActiveFilterChips";
import BarList from "@/components/common/BarList";
import BottomSheet from "@/components/common/BottomSheet";
import ChartFrame from "@/components/common/ChartFrame";
import ColumnChart from "@/components/common/ColumnChart";
import DateRangeControl from "@/components/common/DateRangeControl";
import FilterSelect from "@/components/common/FilterSelect";
import KpiCards from "@/components/common/KpiCards";
import ReportTable from "@/components/reports/ReportTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useActivitiesData, useLeadsData } from "@/hooks/use-analytics";
import { useDateRange } from "@/hooks/use-date-range";
import { PRESET_LABELS, resolveRange, zonedDay } from "@/lib/analytics/ranges";
import { STAGES, STAGE_LABELS, UNASSIGNED } from "@/lib/analytics/metrics";
import type { RangePreset } from "@/lib/analytics/types";
import { buildReport, type Cell, type ReportFilters, type ReportMeta } from "@/lib/reports/definitions";
import { exportFileName, toCsv, toXlsx, type ExportTable } from "@/lib/reports/export";

const KPI_TONE = { default: "slate", ok: "green", warn: "amber", bad: "red", brand: "blue" } as const;
const PRESETS: RangePreset[] = ["today", "7d", "30d", "month", "quarter", "custom"];

function download(name: string, data: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ReportView({ meta }: { meta: ReportMeta }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const remembered = useDateRange("30d");
  const leadsQuery = useLeadsData();
  const activitiesQuery = useActivitiesData();
  const [now] = useState(() => new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visibleRows, setVisibleRows] = useState<Record<string, Cell>[] | null>(null);

  // Everything that shapes the numbers lives in the URL, so a report can be shared and survives a refresh.
  const urlPreset = params.get("range") as RangePreset | null;
  const preset = urlPreset && PRESETS.includes(urlPreset) ? urlPreset : remembered.preset;
  const customFrom = params.get("from") ?? remembered.custom.from;
  const customTo = params.get("to") ?? remembered.custom.to;
  const custom = { from: customFrom, to: customTo };
  const range = useMemo(() => resolveRange(preset, now, customFrom && customTo ? { from: customFrom, to: customTo } : undefined), [preset, customFrom, customTo, now]);
  const filters: ReportFilters = { owner: params.get("owner") || undefined, stage: params.get("stage") || undefined, source: params.get("source") || undefined };

  const update = useCallback((patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  const leads = useMemo(() => leadsQuery.data ?? [], [leadsQuery.data]);
  const activities = useMemo(() => activitiesQuery.data ?? [], [activitiesQuery.data]);
  const owners = useMemo(() => {
    const seen = new Map<string, string>();
    for (const lead of leads) if (lead.ownerId) seen.set(lead.ownerId, lead.ownerName || "Unnamed user");
    return [...seen.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [leads]);
  const sources = useMemo(() => [...new Set(leads.map((l) => l.source.trim() || "Not recorded"))].sort(), [leads]);

  const needsActivities = meta.slug === "activity-volume";
  const loading = leadsQuery.isPending || (needsActivities && activitiesQuery.isPending);
  const failed = leadsQuery.isError || (needsActivities && activitiesQuery.isError);
  const result = useMemo(() => buildReport(meta.slug, { leads, activities, range, filters, now }), [meta.slug, leads, activities, range, filters.owner, filters.stage, filters.source, now]); // eslint-disable-line react-hooks/exhaustive-deps

  const ownerLabel = (id?: string) => (id === UNASSIGNED ? "Unassigned" : owners.find((o) => o.value === id)?.label ?? "Selected owner");
  const chips: FilterChip[] = [];
  if (filters.owner && meta.filters.includes("owner")) chips.push({ key: "owner", label: `Owner: ${ownerLabel(filters.owner)}`, onRemove: () => update({ owner: undefined }) });
  if (filters.stage && meta.filters.includes("stage")) chips.push({ key: "stage", label: `Stage: ${STAGE_LABELS[filters.stage] ?? filters.stage}`, onRemove: () => update({ stage: undefined }) });
  if (filters.source && meta.filters.includes("source")) chips.push({ key: "source", label: `Source: ${filters.source}`, onRemove: () => update({ source: undefined }) });

  const filterControls = (
    <>
      {meta.filters.includes("owner") && <FilterSelect label="Owner" value={filters.owner ?? ""} onChange={(v) => update({ owner: v || undefined })} options={[{ value: "", label: "All owners" }, { value: UNASSIGNED, label: "Unassigned" }, ...owners]} />}
      {meta.filters.includes("stage") && <FilterSelect label="Stage" value={filters.stage ?? ""} onChange={(v) => update({ stage: v || undefined })} options={[{ value: "", label: "All stages" }, ...STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] }))]} />}
      {meta.filters.includes("source") && <FilterSelect label="Source" value={filters.source ?? ""} onChange={(v) => update({ source: v || undefined })} options={[{ value: "", label: "All sources" }, ...sources.map((s) => ({ value: s, label: s }))]} />}
    </>
  );

  const rowsForExport = visibleRows ?? result.rows;
  const exportTable = (): ExportTable => ({
    title: meta.title,
    context: [
      `Report: ${meta.title}`,
      meta.usesRange ? `Period: ${range.label}` : "As of today",
      `Filters: ${chips.length ? chips.map((c) => c.label).join("; ") : "none"}`,
      `Generated: ${new Date().toISOString()}`,
    ],
    columns: result.columns,
    rows: rowsForExport,
  });
  const day = zonedDay(new Date());
  const exportCsv = () => download(exportFileName(meta.slug, "csv", day), toCsv(exportTable()), "text/csv;charset=utf-8");
  const exportXlsx = () => download(exportFileName(meta.slug, "xlsx", day), toXlsx(exportTable()) as BlobPart, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  return (
    <div className="space-y-5">
      <div className="fade-up space-y-3">
        <Link href="/reports" className="no-print inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-strong hover:underline"><ArrowLeft className="size-4" aria-hidden />All reports</Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="sr-only">{meta.title}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">{meta.description}{meta.usesRange ? ` · ${range.label}` : " · As of today"}</p>
          </div>
          <div className="no-print flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={loading || failed}><Download className="size-4" aria-hidden />CSV</Button>
            <Button variant="outline" onClick={exportXlsx} disabled={loading || failed}><FileSpreadsheet className="size-4" aria-hidden />Excel</Button>
            <Button variant="ghost" onClick={() => window.print()} aria-label="Print or save as PDF"><Printer className="size-4" aria-hidden /><span className="hidden sm:inline">Print</span></Button>
          </div>
        </div>
      </div>

      <div className="no-print space-y-3">
        {meta.usesRange && <DateRangeControl preset={preset} custom={custom} onChange={(next, c) => { remembered.choose(next, c); update({ range: next, from: next === "custom" ? c?.from : undefined, to: next === "custom" ? c?.to : undefined }); }} />}
        {meta.filters.length > 0 && (
          <>
            <div className="hidden gap-3 sm:grid sm:grid-cols-3 lg:max-w-3xl">{filterControls}</div>
            <Button variant="outline" className="sm:hidden" onClick={() => setSheetOpen(true)}><SlidersHorizontal className="size-4" aria-hidden />Filters{chips.length ? ` (${chips.length})` : ""}</Button>
          </>
        )}
        <ActiveFilterChips chips={chips} onClearAll={() => update({ owner: undefined, stage: undefined, source: undefined })} />
      </div>

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Filters" description={meta.title} footer={<Button className="w-full" onClick={() => setSheetOpen(false)}>Show results</Button>}>
        <div className="space-y-4">{filterControls}</div>
      </BottomSheet>

      {failed ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-warn/30 bg-warn-soft p-4 text-sm text-warn">
          <span className="flex-1">We couldn&apos;t load the data for this report. Check your connection and try again.</span>
          <Button variant="outline" onClick={() => { void leadsQuery.refetch(); void activitiesQuery.refetch(); }}>Try again</Button>
        </div>
      ) : (
        <>
          <KpiCards items={result.kpis.map((kpi) => ({ ...kpi, tone: KPI_TONE[kpi.tone ?? "default"] }))} loading={loading} />
          {result.note && <p className="text-xs text-muted">{result.note}</p>}
          {loading ? (
            <div className="skeleton h-64" role="status" aria-label="Loading report" />
          ) : (
            <>
              {result.chart && result.rows.length > 0 && (
                <ChartFrame title={result.chart.ariaLabel} table={{ columns: ["Item", "Value"], rows: result.chart.rows.map((r) => [r.label, r.valueLabel ?? r.value]) }}>
                  {result.chart.kind === "bars"
                    ? <BarList ariaLabel={result.chart.ariaLabel} rows={result.chart.rows} />
                    : <ColumnChart ariaLabel={result.chart.ariaLabel} unit={result.chart.unit} points={result.chart.rows} />}
                </ChartFrame>
              )}
              <Card className="gap-3 p-4 sm:p-5">
                <h2 className="text-base font-bold tracking-tight text-ink">Details</h2>
                <ReportTable columns={result.columns} rows={result.rows} rowHref={result.rowHref} onVisibleRows={setVisibleRows} caption={`${meta.title} details`} />
              </Card>
            </>
          )}
        </>
      )}
      <p className="hidden text-xs text-muted print:block">{meta.usesRange ? PRESET_LABELS[preset] : ""} {range.label}</p>
    </div>
  );
}
