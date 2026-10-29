import type { FollowUpItem, FollowUpQueryFilters } from "@/types/follow-up";
import type { Subscription } from "@/types/subscription";

export const DASHBOARD_TIME_ZONE = "Asia/Kolkata";
export const DASHBOARD_PREVIEW_LIMIT = 5;

export function dashboardPreview<T>(items: readonly T[]): T[] {
  return items.slice(0, DASHBOARD_PREVIEW_LIMIT);
}

const dashboards = {
  SUPERADMIN: { title: "Platform overview", description: "Keep workspaces healthy and subscription requests moving.", scope: "Platform", personal: false },
  ADMIN: { title: "Workspace overview", description: "Track your sales pipeline, follow-up priorities, and workspace health.", scope: "Workspace", personal: false },
  MANAGER: { title: "Sales operations", description: "Spot pipeline bottlenecks and balance upcoming follow-up work.", scope: "Workspace", personal: false },
  SALES: { title: "My sales desk", description: "Start with overdue customers, then work through today's conversations.", scope: "Assigned to me", personal: true },
  USER: { title: "My workday", description: "Your assigned follow-ups, organized around what needs attention next.", scope: "Assigned to me", personal: true },
} as const;

export type DashboardRole = keyof typeof dashboards;

export function dashboardConfig(role: string) {
  const normalized = role.trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(dashboards, normalized)
    ? { role: normalized as DashboardRole, ...dashboards[normalized as DashboardRole] }
    : null;
}

export function dashboardDates(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DASHBOARD_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  const start = new Date(`${today}T00:00:00+05:30`).getTime();
  const day = 86_400_000;
  return {
    day: today,
    fromDate: new Date(start).toISOString(),
    toDate: new Date(start + day - 1).toISOString(),
    upcomingFrom: new Date(start + day).toISOString(),
    upcomingTo: new Date(start + day * 8 - 1).toISOString(),
  };
}

export function dashboardFollowUpFilters(assignedTo: string, extra: Partial<FollowUpQueryFilters> = {}): FollowUpQueryFilters {
  return {
    page: 1, limit: DASHBOARD_PREVIEW_LIMIT, businessId: "", businessName: "", assignedTo,
    assignedToName: "", status: "", type: "", fromDate: "", toDate: "", tab: "all", ...extra,
  };
}

export function pipelineSummary(counts: { status: string; count: number }[]) {
  const total = counts.reduce((sum, stage) => sum + stage.count, 0);
  const won = counts.find((stage) => stage.status === "WON")?.count ?? 0;
  const lost = counts.find((stage) => stage.status === "LOST")?.count ?? 0;
  return { total, won, lost, open: total - won - lost, winRate: won + lost ? Math.round(won / (won + lost) * 100) : null };
}

export function followUpWorkload(items: FollowUpItem[]) {
  const owners = new Map<string, { id: string; name: string; count: number }>();
  for (const item of items) {
    if (item.status.toUpperCase() !== "SCHEDULED") continue;
    const id = item.assignedToId || "unassigned";
    const owner = owners.get(id) ?? { id, name: item.assignedToName || "Unassigned", count: 0 };
    owner.count++;
    owners.set(id, owner);
  }
  return [...owners.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function subscriptionSummary(subscriptions: Subscription[], now: Date) {
  const time = now.getTime();
  const active = subscriptions.filter((subscription) => {
    if (subscription.status !== "ACTIVE") return false;
    const start = subscription.startDate ? Date.parse(subscription.startDate) : -Infinity;
    const end = subscription.endDate ? Date.parse(subscription.endDate) : Infinity;
    return start <= time && end > time;
  });
  return {
    active: active.length,
    pending: subscriptions.filter((item) => item.status === "PENDING"),
    expiring: active.filter((item) => item.endDate && Date.parse(item.endDate) <= time + 7 * 86_400_000)
      .sort((a, b) => Date.parse(a.endDate!) - Date.parse(b.endDate!)),
  };
}

export function dashboardDateLabel(value: string, withTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: DASHBOARD_TIME_ZONE, day: "numeric", month: "short",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } as const : {}),
  }).format(date);
}
