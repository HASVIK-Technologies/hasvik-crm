"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, CircleAlert, Mail, MessageCircle, Phone, Video, type LucideIcon } from "lucide-react";
import { createContext, useContext, type ReactNode } from "react";
import type { FollowUpItem, FollowUpQueryFilters } from "@/types/follow-up";
import { dashboardDateLabel, dashboardPreview } from "@/lib/dashboard/model";
import { useFollowUpListStore } from "@/store/follow-up-list-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { getSubscriptionStatusVisual } from "@/lib/subscriptions/status";
import type { SubscriptionStatus } from "@/types/subscription";

const panelColors = {
  blue: { icon: "bg-blue-600 text-white" },
  green: { icon: "bg-emerald-700 text-white" },
  cyan: { icon: "bg-cyan-700 text-white" },
  amber: { icon: "bg-amber-700 text-white" },
  rose: { icon: "bg-rose-600 text-white" },
};

const ColoredPanelContext = createContext(false);
const coloredSurfaces = {
  blue: "border-[#0870c9] from-[#0870c9] to-[#0860ad]",
  green: "border-[#117a35] from-[#117a35] to-[#0c6940]",
  cyan: "border-[#08758f] from-[#08758f] to-[#07677e]",
  amber: "border-[#2563a1] from-[#2563a1] to-[#1c528b]",
  rose: "border-[#08758f] from-[#08758f] to-[#07677e]",
};

export function DashboardPanel({ title, description, action, children, className, tone = "blue", icon: Icon, variant = "white" }: {
  title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string;
  tone?: keyof typeof panelColors; icon?: LucideIcon;
  variant?: "white" | "colored";
}) {
  const color = panelColors[tone];
  const colored = variant === "colored";
  return <section className={cn("min-w-0 overflow-hidden rounded-none border shadow-[0_3px_16px_rgba(15,45,65,0.04)]", colored ? cn("bg-linear-to-br text-white", coloredSurfaces[tone]) : "border-slate-200 bg-white", className)}>
    <ColoredPanelContext.Provider value={colored}>
    <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3", colored ? "border-white/15" : "border-slate-100")}>
      <div className="flex min-w-0 flex-1 items-start gap-3">{Icon && <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-none", colored ? "bg-white/10 text-white ring-1 ring-inset ring-white/15" : color.icon)}><Icon className="size-4" /></span>}<div className="min-w-0"><h2 className={cn("text-sm font-bold", colored ? "text-white" : "text-slate-900")}>{title}</h2>{description && <p className={cn("mt-1 max-w-xl text-xs leading-relaxed", colored ? "text-white" : "text-slate-600")}>{description}</p>}</div></div>
      {action}
    </div>
    <div className="p-4">{children}</div>
    </ColoredPanelContext.Provider>
  </section>;
}

export type QueryStatus = { isPending: boolean; isError: boolean; refetch: () => unknown };

export function QueryContent({ query, children }: { query: QueryStatus; children: ReactNode }) {
  const colored = useContext(ColoredPanelContext);
  if (query.isPending) return <div role="status" aria-label="Loading dashboard section" className="space-y-3 py-2">{[0, 1, 2].map((i) => <div key={i} className={cn("h-14 animate-pulse rounded-none", colored ? "bg-white/10" : "bg-slate-100")} />)}</div>;
  if (query.isError) return <div role="alert" className={cn("flex flex-wrap items-center gap-3 rounded-none p-4 text-sm", colored ? "bg-white/10 text-amber-100" : "bg-amber-50 text-amber-900")}><CircleAlert className="size-4 shrink-0" /><span className="flex-1">This section could not be loaded.</span><button type="button" onClick={() => void query.refetch()} className="font-semibold underline underline-offset-4">Retry</button></div>;
  return children;
}

export function EmptyDashboardState({ message }: { message: string }) {
  const colored = useContext(ColoredPanelContext);
  return <div className="flex min-h-20 items-center justify-center gap-3 rounded-none py-3 text-left"><span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full ring-1", colored ? "bg-white/10 text-emerald-100 ring-white/15" : "bg-emerald-50 text-emerald-600 ring-emerald-100")}><CheckCircle2 className="size-5" /></span><p className={cn("max-w-xs text-sm leading-relaxed", colored ? "text-white" : "text-slate-500")}>{message}</p></div>;
}

export function DashboardFacts({ items }: { items: { label: string; value: ReactNode; status?: SubscriptionStatus }[] }) {
  const colored = useContext(ColoredPanelContext);
  return <dl className={cn("grid grid-cols-2 gap-3", items.length > 2 && "sm:grid-cols-3")}>{items.map((item) => {
    const visual = item.status ? getSubscriptionStatusVisual(item.status) : undefined;
    return <div key={item.label} className={cn("rounded-none border p-3", colored ? "border-white/15 bg-white/5" : "border-slate-100 bg-slate-50", visual && "border-l-[3px]", visual?.accent)}><dt className={cn("flex items-center gap-1.5 text-[11px] leading-relaxed", colored ? "text-white" : "text-slate-500")}>{visual && <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", colored ? visual.darkDot : visual.dot)} />}{item.label}</dt><dd className={cn("mt-1 text-lg font-bold", colored ? "text-white" : "text-slate-900")}>{item.value}</dd></div>;
  })}</dl>;
}

export function DashboardLink({ href, children }: { href: string; children: ReactNode }) {
  const colored = useContext(ColoredPanelContext);
  return <Link href={href} className={cn("inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4", colored ? "text-white focus-visible:outline-white" : "text-brand-blue focus-visible:outline-brand-blue")}>{children}<ArrowRight className="size-3.5" /></Link>;
}

export function FollowUpQueueLink({ assignedTo, filters = {}, children = "View all" }: {
  assignedTo: string; filters?: Partial<FollowUpQueryFilters>; children?: ReactNode;
}) {
  const colored = useContext(ColoredPanelContext);
  return <Link href="/follow-ups" onClick={() => {
    const store = useFollowUpListStore.getState();
    store.reset();
    const user = useAuthStore.getState().user;
    useFollowUpListStore.setState({ view: "table", assignedTo, assignedToName: assignedTo === user?.userId ? user.fullName || user.email : "", ...filters, page: 1 });
  }} className={cn("inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4", colored ? "text-white focus-visible:outline-white" : "text-brand-blue focus-visible:outline-brand-blue")}>{children}<ArrowRight className="size-3.5" /></Link>;
}

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700", CANCELLED: "bg-slate-100 text-slate-500",
  OVERDUE: "bg-rose-50 text-rose-700", SCHEDULED: "bg-blue-50 text-brand-blue",
};

const typeStyles: Record<string, string> = {
  CALL: "bg-blue-50 text-blue-600 ring-blue-100", EMAIL: "bg-amber-50 text-amber-700 ring-amber-100",
  WHATSAPP: "bg-emerald-50 text-emerald-600 ring-emerald-100", MEETING: "bg-cyan-50 text-cyan-700 ring-cyan-100",
};

export function FollowUpQueue({ items, shared, emptyMessage, total }: {
  items: FollowUpItem[]; shared: boolean; emptyMessage: string; total?: number;
}) {
  const colored = useContext(ColoredPanelContext);
  const rows = dashboardPreview([...items].sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt)));
  if (!rows.length) return <EmptyDashboardState message={emptyMessage} />;
  return <>
    <div className={cn("divide-y", colored ? "divide-white/15" : "divide-slate-100")}>
      {rows.map((item) => {
        const Icon = ({ CALL: Phone, EMAIL: Mail, WHATSAPP: MessageCircle, MEETING: Video })[item.type] ?? CalendarClock;
        return <Link key={item.id} href={`/follow-ups/${encodeURIComponent(item.id)}`} className={cn("group -mx-2 flex items-start gap-3 rounded-none px-2 py-3 transition-colors first:pt-0 last:pb-0 focus-visible:outline-2", colored ? "hover:bg-white/5 focus-visible:outline-white" : "hover:bg-blue-50/50 focus-visible:outline-brand-blue")}>
          <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-none ring-1 ring-inset", item.status === "OVERDUE" ? "bg-rose-50 text-rose-600 ring-rose-100" : typeStyles[item.type] ?? "bg-slate-100 text-slate-500 ring-slate-200")}><Icon className="size-4" /></span>
          <span className="min-w-0 flex-1"><span className={cn("block truncate text-sm font-semibold", colored ? "text-white" : "text-slate-800 group-hover:text-brand-blue")}>{item.businessName || "Business follow-up"}</span><span className={cn("mt-1 block text-xs leading-relaxed", colored ? "text-white" : "text-slate-500")}><span className="capitalize">{item.type.toLowerCase().replaceAll("_", " ")}</span> · {dashboardDateLabel(item.scheduledAt, true)}{item.businessCity && <span className="block truncate">{item.businessCity}</span>}{shared && <span className="block truncate">Assigned to {item.assignedToName || "Unassigned"}</span>}{item.notes && <span className="mt-1 line-clamp-1">{item.notes}</span>}</span></span>
          <span className={cn("mt-0.5 shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold capitalize", statusStyles[item.status] ?? "bg-slate-100 text-slate-600")}>{item.status.toLowerCase()}</span>
        </Link>;
      })}
    </div>
    {total !== undefined && total > rows.length && <p className={cn("mt-4 border-t pt-3 text-xs", colored ? "border-white/15 text-white" : "border-slate-100 text-slate-500")}>Showing {rows.length} of {total} follow-ups. Open the full list to see all.</p>}
  </>;
}

export function metricValue(query: { isPending: boolean; isError: boolean }, value: number | string | undefined) {
  if (query.isPending) return <span aria-label="Loading" className="block h-6 w-12 animate-pulse bg-slate-100" />;
  return query.isError || value === undefined ? <span title="Metric unavailable" aria-label="Metric unavailable">—</span> : typeof value === "number" ? value.toLocaleString("en-IN") : value;
}
