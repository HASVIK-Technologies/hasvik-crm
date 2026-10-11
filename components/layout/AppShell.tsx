"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CalendarCheck2,
  ChevronDown,
  CreditCard,
  FolderKanban,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Settings2,
  UserRound,
  X,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthSession, useLogout, useTokenRefresh } from "@/hooks/use-auth";
import { useTenantQuery, useTenantsQuery } from "@/hooks/use-tenants";
import { useSubscriptionsQuery } from "@/hooks/use-subscriptions";
import { useAuthStore } from "@/store/auth-store";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  getSubscriptionTenantId,
  hasCurrentSubscriptionAccess,
} from "@/lib/subscriptions/access";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { label: "Businesses", href: "/businesses", icon: Building2 },
  { label: "Follow-ups", href: "/follow-ups", icon: CalendarCheck2 },
  { label: "User management", href: "/users", icon: Users },
  { label: "Business categories", href: "/business-categories", icon: FolderKanban },
  { label: "Tenant management", href: "/tenant-management", icon: Users },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
];

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/explore-crm" || pathname === "/tenant";
}

function isTenantAdmin(role?: string) {
  return role?.toUpperCase() === "ADMIN";
}

function isHasvikAdmin(role?: string) {
  return role?.toUpperCase() === "ADMIN";
}

function isNavigationItemVisible(
  item: (typeof navigation)[number],
  tenantAdmin: boolean,
  hasvikAdmin: boolean,
) {
  if (hasvikAdmin) return true;
  if (item.href === "/subscriptions") return tenantAdmin;
  if (item.href === "/tenant-management") return false;
  if (item.href === "/users" || item.href === "/business-categories") {
    return tenantAdmin;
  }
  return true;
}

const pageDetails: Record<string, { title: string }> = {
  "/dashboard": {
    title: "Dashboard",
  },
  "/businesses": {
    title: "All Businesses",
  },
};

function isActivePath(pathname: string, href: string) {
  const basePath = href.split("#")[0];
  if (
    basePath === "/businesses" ||
    basePath === "/follow-ups" ||
    basePath === "/users" ||
    basePath === "/business-categories"
  ) {
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  }
  return pathname === basePath;
}

function getPageDetails(pathname: string) {
  if (pathname === "/follow-ups") {
    return { title: "Follow-ups" };
  }

  if (pathname === "/subscriptions") {
    return { title: "Subscriptions" };
  }

  if (pathname === "/tenant-management") {
    return { title: "Tenant management" };
  }

  if (pathname === "/users") {
    return { title: "User management" };
  }

  if (pathname === "/business-categories") {
    return { title: "Business categories" };
  }

  if (pathname === "/profile") {
    return { title: "My profile" };
  }

  if (pathname.startsWith("/follow-ups/")) {
    return { title: "Follow-up Details" };
  }

  if (pathname === "/businesses/form" || pathname.startsWith("/businesses/form/")) {
    const isEdit = pathname.startsWith("/businesses/form/");
    return {
      title: isEdit ? "Edit Business" : "Add Business",
    };
  }

  if (pathname.startsWith("/businesses/") && !pathname.startsWith("/businesses/form")) {
    return {
      title: "Business Details",
    };
  }

  return pageDetails[pathname] ?? pageDetails["/dashboard"];
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const publicPath = isPublicPath(pathname);
  const sessionQuery = useAuthSession(!publicPath);
  useTokenRefresh();
  const logoutMutation = useLogout();
  const authStatus = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const pageDetailsForPath = getPageDetails(pathname);
  const tenantAdmin = isTenantAdmin(user?.role);
  const hasvikAdmin = isHasvikAdmin(user?.role);
  const tenantQuery = useTenantQuery(
    user?.tenantId,
    !publicPath && !hasvikAdmin,
  );
  const tenantsQuery = useTenantsQuery(
    !publicPath && !hasvikAdmin && !user?.tenantId,
    user?.userId,
  );
  const subscriptionsQuery = useSubscriptionsQuery(
    user?.userId,
    !publicPath && authStatus === "authenticated" && !hasvikAdmin,
  );
  const resolvedTenantId =
    user?.tenantId ??
    tenantsQuery.data?.find(
      (tenant) =>
        tenant.contactEmail?.toLowerCase() === user?.email.toLowerCase(),
    )?.id;
  const tenantSubscription = subscriptionsQuery.data?.some(
    (subscription) =>
      getSubscriptionTenantId(subscription) === resolvedTenantId &&
      hasCurrentSubscriptionAccess(subscription),
  ) ?? false;
  const subscriptionAccessError =
    !hasvikAdmin &&
    (subscriptionsQuery.isError ||
      tenantsQuery.isError ||
      (!user?.tenantId &&
        !tenantsQuery.isPending &&
        !tenantsQuery.isError &&
        !resolvedTenantId));
  const subscriptionAccessPending =
    !hasvikAdmin &&
    authStatus === "authenticated" &&
    (subscriptionsQuery.isPending ||
      (!user?.tenantId && tenantsQuery.isPending));
  const subscriptionAccessBlocked =
    !hasvikAdmin &&
    authStatus === "authenticated" &&
    !subscriptionAccessPending &&
    (subscriptionAccessError || !tenantSubscription);

  useEffect(() => {
    if (pathname === "/" && authStatus === "authenticated" && user) {
      const signupWelcome =
        new URLSearchParams(window.location.search).get("welcome") ===
        "subscription";
      router.replace(
        signupWelcome && tenantAdmin ? "/subscriptions" : "/businesses",
      );
    }
    if (
      subscriptionAccessBlocked &&
      tenantAdmin &&
      pathname !== "/subscriptions"
    ) {
      router.replace("/subscriptions");
    }
    if (
      !publicPath &&
      (sessionQuery.isError ||
        (authStatus === "unauthenticated" && !sessionQuery.isPending))
    ) {
      clearAuth();
      router.replace("/");
    }
    if (
      pathname === "/subscriptions" &&
      authStatus === "authenticated" &&
      user &&
      !isTenantAdmin(user.role) &&
      !isHasvikAdmin(user.role)
    ) {
      router.replace("/businesses");
    }
    if (
      pathname === "/tenant-management" &&
      authStatus === "authenticated" &&
      user &&
      !isHasvikAdmin(user.role)
    ) {
      router.replace(isTenantAdmin(user.role) ? "/subscriptions" : "/businesses");
    }
    if (
      (pathname === "/users" || pathname === "/business-categories") &&
      authStatus === "authenticated" &&
      user &&
      !isTenantAdmin(user.role) &&
      !isHasvikAdmin(user.role)
    ) {
      router.replace("/businesses");
    }
  }, [
    authStatus,
    clearAuth,
    pathname,
    publicPath,
    router,
    sessionQuery.isError,
    sessionQuery.isPending,
    hasvikAdmin,
    tenantAdmin,
    subscriptionAccessBlocked,
    user,
  ]);

  if (publicPath) {
    return <>{children}</>;
  }

  if (authStatus !== "authenticated" || sessionQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Restoring your session...
      </main>
    );
  }

  if (pathname === "/subscriptions" && !tenantAdmin && !hasvikAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Redirecting to your workspace…
      </main>
    );
  }

  if (pathname === "/tenant-management" && !hasvikAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Redirecting to your workspace…
      </main>
    );
  }

  if (
    (pathname === "/users" || pathname === "/business-categories") &&
    !tenantAdmin &&
    !hasvikAdmin
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Redirecting to your workspace…
      </main>
    );
  }

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      router.replace("/");
    }
  }

  const displayName = user?.fullName || user?.email || "Hasvik user";
  const firstName =
    user?.firstName?.trim() ||
    user?.fullName?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "there";
  const currentPageTitle =
    pathname === "/dashboard"
      ? `Good morning, ${firstName}`
      : pageDetailsForPath.title;
  const displayRole = user?.role || "User";
  const resolvedTenant = tenantsQuery.data?.find(
    (tenant) => tenant.id === resolvedTenantId,
  );
  const currentTenantName =
    tenantQuery.data?.name ?? resolvedTenant?.name;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#e4ecf2] bg-white transition-[width] lg:flex ${sidebarCollapsed ? "w-20" : "w-64"}`}>
        {/* Brand Logo Header */}
        <div className={`flex h-20 items-center border-b border-[#f1f5f9] ${sidebarCollapsed ? "justify-center px-3" : "px-6"}`}>
          <Link href="/dashboard" aria-label="Hasvik home">
            <Image
              src="/logo.png"
              alt="Hasvik"
              width={140}
              height={42}
              priority
              style={{ height: "auto" }}
              className={sidebarCollapsed ? "w-10 object-cover object-left" : "w-32"}
            />
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <div className={`flex flex-1 flex-col justify-between py-6 ${sidebarCollapsed ? "px-2" : "px-4"}`}>
          <div>
            <nav className="space-y-1.5" aria-label="Main navigation">
              {navigation
                .filter((item) =>
                  isNavigationItemVisible(item, tenantAdmin, hasvikAdmin),
                )
                .map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex rounded-xl text-xs font-semibold transition-all ${sidebarCollapsed ? "flex-col gap-1 px-1 py-2 text-center" : "items-center gap-3 px-3.5 py-2.5"} ${
                      active
                        ? "bg-secondary/10 text-brand-green-strong"
                        : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                    }`}
                  >
                    <Icon
                      className="size-4"
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className={sidebarCollapsed ? "text-[10px] leading-tight" : ""}>{item.label}</span>
                  </Link>
                );
                })}
            </nav>

          </div>

          {/* Sidebar collapse control */}
          <div className="border-t border-[#f1f5f9] pt-4">
            <button
              type="button"
              aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              title={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              className={`flex w-full items-center rounded-xl p-2.5 text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a] ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              {!sidebarCollapsed && <span className="text-xs font-semibold">Collapse navigation</span>}
            </button>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}>
        {/* Sticky Header matching screenshot */}
        <header className="sticky top-0 z-20 border-b border-[#e4ecf2] bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-5 sm:px-8">
            {/* Left Header Title / Eyebrow */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl p-2 text-[#64748b] hover:bg-[#f1f5f9] lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl">
                  {currentPageTitle}
                </h1>
              </div>
            </div>

            {/* User Profile in Header */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {!hasvikAdmin && resolvedTenantId && (
                <div
                  className="flex min-w-0 max-w-36 items-center gap-2 rounded-xl border border-[#e4ecf2] bg-[#f8fafc] px-2.5 py-2 sm:max-w-60 sm:px-3"
                  title={
                    tenantQuery.isError
                      ? getApiErrorMessage(tenantQuery.error)
                      : currentTenantName ?? "Loading workspace"
                  }
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                    <Building2 className="size-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Workspace
                    </span>
                    <span className="block truncate text-[11px] font-bold text-slate-700 sm:text-xs">
                      {currentTenantName ??
                        (tenantQuery.isError ? "Unavailable" : "Loading…")}
                    </span>
                  </span>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open user menu"
                    className="group flex items-center gap-2 rounded-xl border border-transparent p-1.5 text-left outline-none transition hover:border-slate-200 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary sm:gap-2.5 sm:pl-2"
                  >
                    <Avatar className="size-9 border border-white bg-gradient-to-br from-primary to-brand-green text-white shadow-sm ring-1 ring-slate-200">
                      <AvatarFallback className="bg-transparent text-[11px] font-bold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden min-w-0 sm:block">
                      <span className="block max-w-32 truncate text-xs font-bold text-slate-800">
                        {displayName}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                        {hasvikAdmin ? "HASVIK Admin" : "Workspace account"}
                      </span>
                    </span>
                    <ChevronDown className="hidden size-3.5 text-slate-400 transition group-hover:text-slate-600 sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-72 rounded-2xl border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
                >
                  <DropdownMenuLabel className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/70 p-3 font-normal">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11 border border-white bg-gradient-to-br from-primary to-brand-green text-white shadow-sm ring-1 ring-slate-200">
                        <AvatarFallback className="bg-transparent text-xs font-bold text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-white px-2 py-1 text-[10px] font-semibold text-primary">
                        <ShieldCheck className="size-3" />
                        {displayRole.replaceAll("_", " ")}
                      </span>
                      {currentTenantName && !hasvikAdmin && (
                        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">
                          <Building2 className="size-3 shrink-0" />
                          <span className="truncate">{currentTenantName}</span>
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-lg px-3 text-xs font-medium text-slate-700 focus:bg-blue-50 focus:text-primary">
                    <Link href="/profile">
                      <UserRound className="mr-2 size-4 text-slate-400" />
                      Account settings
                      <Settings2 className="ml-auto size-3.5 text-slate-400" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    disabled={logoutMutation.isPending}
                    onClick={() => void handleLogout()}
                    className="h-10 cursor-pointer rounded-lg px-3 text-xs font-semibold text-rose-700 focus:bg-rose-50 focus:text-rose-800"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <nav
              className="border-t border-[#f1f5f9] bg-white px-5 py-3 lg:hidden"
              aria-label="Mobile navigation"
            >
              {navigation
                .filter((item) =>
                  isNavigationItemVisible(item, tenantAdmin, hasvikAdmin),
                )
                .map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                      active
                        ? "bg-[#ecfdf3] text-secondary"
                        : "text-[#64748b] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
                })}
            </nav>
          )}
        </header>

        <main className="min-h-[calc(100vh-5rem)] px-3 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-6">
          <div className="mx-auto w-full">
            {subscriptionAccessPending ? (
              <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
                Checking workspace subscription…
              </div>
            ) : subscriptionAccessBlocked && !tenantAdmin ? (
              <section className="mx-auto mt-8 w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-7 text-center shadow-sm sm:p-9">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <CreditCard className="size-5" />
                </span>
                <h1 className="mt-4 text-lg font-bold text-slate-900">
                  Workspace subscription required
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {subscriptionAccessError
                    ? "We couldn’t verify your workspace subscription. Please try again shortly or contact your workspace administrator."
                    : "Your workspace does not currently have an active subscription. Contact your workspace administrator to choose or renew a plan."}
                </p>
                {subscriptionsQuery.isError && (
                  <p className="mt-3 text-xs text-rose-700">
                    {getApiErrorMessage(subscriptionsQuery.error)}
                  </p>
                )}
                {tenantsQuery.isError && (
                  <p className="mt-3 text-xs text-rose-700">
                    {getApiErrorMessage(tenantsQuery.error)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    void subscriptionsQuery.refetch();
                    if (tenantsQuery.isError) void tenantsQuery.refetch();
                  }}
                  className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary/90"
                >
                  Try again
                </button>
              </section>
            ) : subscriptionAccessBlocked &&
              tenantAdmin &&
              pathname !== "/subscriptions" ? (
              <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
                Redirecting to subscription management…
              </div>
            ) : (
              <>
                {subscriptionAccessBlocked &&
                  tenantAdmin &&
                  pathname === "/subscriptions" && (
                    <div
                      role={subscriptionAccessError ? "alert" : "status"}
                      className={`mb-5 rounded-xl border px-4 py-3 text-xs leading-5 ${
                        subscriptionAccessError
                          ? "border-rose-200 bg-rose-50 text-rose-900"
                          : "border-amber-200 bg-amber-50 text-amber-950"
                      }`}
                    >
                      {subscriptionAccessError
                        ? "We couldn’t verify your workspace subscription. Refresh the page or contact support before continuing."
                        : "Your workspace does not have an active subscription. Choose a plan or wait for HASVIK admin approval; other workspace pages remain unavailable until access is active."}
                    </div>
                  )}
                {children}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
