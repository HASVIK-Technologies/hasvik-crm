import Link from "next/link";
import { ArrowRight, BarChart3, ChevronRight, CalendarCheck2, Filter, Hourglass, PlusCircle, Trophy, Users, Waypoints, type LucideIcon } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { REPORTS, type ReportSlug } from "@/lib/reports/definitions";

export const metadata = { title: "Reports" };

const ICONS: Record<ReportSlug, LucideIcon> = {
  "pipeline-by-stage": BarChart3, "win-loss": Trophy, "sales-by-owner": Users, "sales-by-source": Waypoints,
  "deal-aging": Hourglass, "activity-volume": CalendarCheck2, "new-leads": PlusCircle, "conversion-funnel": Filter,
};

export default function ReportsPage() {
  return (
    <PageContainer className="space-y-6">
      <div className="fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">Reports</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Pick a report to see the numbers, filter them, and export exactly what is on screen to CSV or Excel.</p>
      </div>
      <ul className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((report) => {
          const Icon = ICONS[report.slug];
          return (
            <li key={report.slug}>
              {/* A compact row on phones, a card from tablet up. */}
              <Link href={`/reports/${report.slug}`} className="group flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition-all duration-150 hover:-translate-y-1 hover:border-brand hover:bg-brand-soft/40 hover:shadow-pop active:scale-[0.98] sm:min-h-32 sm:flex-col sm:items-start sm:gap-0 sm:p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong"><Icon className="size-5" aria-hidden /></span>
                <span className="min-w-0 flex-1 sm:flex sm:flex-col">
                  <h2 className="text-base font-bold tracking-tight text-ink sm:mt-4">{report.title}</h2>
                  <p className="mt-0.5 text-sm text-muted sm:mt-1 sm:flex-1">{report.description}</p>
                  <span className="mt-4 hidden items-center gap-1 text-sm font-semibold text-brand-strong sm:inline-flex">Open report<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted sm:hidden" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
