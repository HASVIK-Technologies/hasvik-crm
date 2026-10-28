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

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown in the bottom tab bar on phones (the rest live under "More"). */
  primary?: boolean;
  /** Extra words the command palette matches on. */
  keywords?: string;
  visible?: (user: Pick<AuthUser, "role"> | null | undefined) => boolean;
}

const admins = (user: Pick<AuthUser, "role"> | null | undefined) => isSuperAdmin(user) || isTenantAdmin(user);
const reviewers = (user: Pick<AuthUser, "role"> | null | undefined) => admins(user) || user?.role?.trim().toUpperCase() === "MANAGER";

export const navigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, primary: true, keywords: "home overview" },
  { label: "Businesses", href: "/businesses", icon: Building2, primary: true, keywords: "leads kanban pipeline companies" },
  { label: "Follow-ups", href: "/follow-ups", icon: CalendarCheck2, primary: true, keywords: "tasks calls meetings calendar" },
  { label: "Reports", href: "/reports", icon: BarChart3, primary: true, keywords: "analytics export csv" },
  { label: "Forecast", href: "/forecast", icon: TrendingUp, keywords: "predict trend win rate" },
  { label: "Audit logs", href: "/audit-logs", icon: History, keywords: "activity history changes", visible: reviewers },
  { label: "Users", href: "/users", icon: Users, keywords: "team people roles", visible: admins },
  { label: "Business categories", href: "/business-categories", icon: FolderKanban, keywords: "industries", visible: admins },
  { label: "Tenant management", href: "/tenant-management", icon: Landmark, keywords: "workspaces organisations", visible: admins },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard, keywords: "plans billing", visible: admins },
  { label: "Settings", href: "/settings", icon: Settings2, keywords: "profile password theme appearance dark" },
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
  return TITLES.find(([prefix]) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix))?.[1] ?? "HASVIK CRM";
}
