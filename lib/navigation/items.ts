import {
  BarChart3,
  Building2,
  CalendarCheck2,
  CreditCard,
  FolderKanban,
  History,
  Landmark,
  LayoutDashboard,
  Settings2,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { isSuperAdmin, isTenantAdmin, type AuthUser } from "@/types/auth";
import { reportMeta } from "@/lib/reports/definitions";

const reportTitle = (slug: string) => reportMeta(slug)?.title;

export type NavGroup = "sell" | "insights" | "admin" | "settings";

export const NAV_GROUP_LABELS: Record<NavGroup, string> = { sell: "Sell", insights: "Insights", admin: "Admin", settings: "" };

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown in the bottom tab bar on phones (the rest live under "More"). */
  primary?: boolean;
  /** Sidebar section. Settings is pinned to the bottom of the sidebar. */
  group: NavGroup;
  /** Extra words the command palette matches on. */
  keywords?: string;
  visible?: (user: Pick<AuthUser, "role"> | null | undefined) => boolean;
}

const admins = (user: Pick<AuthUser, "role"> | null | undefined) => isSuperAdmin(user) || isTenantAdmin(user);
const reviewers = (user: Pick<AuthUser, "role"> | null | undefined) => admins(user) || user?.role?.trim().toUpperCase() === "MANAGER";

export const navigation: NavItem[] = [
  { group: "sell", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, primary: true, keywords: "home overview" },
  { group: "sell", label: "Businesses", href: "/businesses", icon: Building2, primary: true, keywords: "leads kanban pipeline companies" },
  { group: "sell", label: "Follow-ups", href: "/follow-ups", icon: CalendarCheck2, primary: true, keywords: "tasks calls meetings calendar" },
  { group: "insights", label: "Reports", href: "/reports", icon: BarChart3, primary: true, keywords: "analytics export csv" },
  { group: "insights", label: "Forecast", href: "/forecast", icon: TrendingUp, keywords: "predict trend win rate" },
  { group: "admin", label: "Users", href: "/users", icon: Users, keywords: "team people roles", visible: admins },
  { group: "admin", label: "Business categories", href: "/business-categories", icon: FolderKanban, keywords: "industries", visible: admins },
  { group: "admin", label: "Tenant management", href: "/tenant-management", icon: Landmark, keywords: "workspaces organisations", visible: admins },
  { group: "admin", label: "Subscriptions", href: "/subscriptions", icon: CreditCard, keywords: "plans billing", visible: admins },
  { group: "admin", label: "Audit logs", href: "/audit-logs", icon: History, keywords: "activity history changes", visible: reviewers },
  { group: "settings", label: "Settings", href: "/settings", icon: Settings2, keywords: "profile password theme appearance dark" },
];

export function visibleNavigation(user: Pick<AuthUser, "role"> | null | undefined): NavItem[] {
  return navigation.filter((item) => !item.visible || item.visible(user));
}

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const TITLES: [string, string][] = [
  ["/businesses/form/", "Edit business"],
  ["/businesses/form", "Add business"],
  ["/businesses/", "Business details"],
  ["/businesses", "Businesses"],
  ["/follow-ups/", "Follow-up details"],
  ["/follow-ups", "Follow-ups"],
  ["/reports", "Reports"],
  ["/forecast", "Forecast"],
  ["/audit-logs", "Audit logs"],
  ["/users", "Users"],
  ["/business-categories", "Business categories"],
  ["/tenant-management", "Tenant management"],
  ["/subscriptions", "Subscriptions"],
  ["/settings", "Settings"],
  ["/profile", "My profile"],
  ["/dashboard", "Dashboard"],
];

export function pageTitle(pathname: string) {
  const report = pathname.match(/^\/reports\/([^/]+)/);
  if (report) return reportTitle(report[1]) ?? "Report";
  return TITLES.find(([prefix]) => (prefix.endsWith("/") ? pathname.startsWith(prefix) : pathname === prefix))?.[1] ?? "HASVIK CRM";
}
