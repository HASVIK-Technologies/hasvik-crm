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
  Landmark,
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
import { useTenantQuery } from "@/hooks/use-tenants";
import { useSubscriptionsQuery } from "@/hooks/use-subscriptions";
import { useAuthStore } from "@/store/auth-store";
import { isSuperAdmin, isTenantAdmin } from "@/types/auth";
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
  { label: "Tenant management", href: "/tenant-management", icon: Landmark },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
];

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/explore-crm" || pathname === "/tenant";
}

function isNavigationItemVisible(
  item: (typeof navigation)[number],
  tenantAdmin: boolean,
  hasvikAdmin: boolean,
) {
  if (hasvikAdmin) return true;
  if (item.href === "/subscriptions") return tenantAdmin;
  if (item.href === "/tenant-management") return tenantAdmin;
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
  const sessionQuery = useAuthSession(!publicPath || pathname === "/");
  useTokenRefresh();
  const logoutMutation = useLogout();
  const authStatus = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const restoreBlocked = useAuthStore((state) => state.restoreBlocked);
  const loggingOut = useAuthStore((state) => state.isLoggingOut);
  const pageDetailsForPath = getPageDetails(pathname);
  const tenantAdmin = isTenantAdmin(user);
  const hasvikAdmin = isSuperAdmin(user);
  const tenantQuery = useTenantQuery(
    user?.tenantId,
    !publicPath && authStatus === "authenticated" && !hasvikAdmin,
  );
  const subscriptionsQuery = useSubscriptionsQuery(
    user?.userId,
    !publicPath && authStatus === "authenticated" && !hasvikAdmin,
  );
  const resolvedTenantId = user?.tenantId;
  const tenantSubscription = subscriptionsQuery.data?.some(
    (subscription) =>
      getSubscriptionTenantId(subscription) === resolvedTenantId &&
      hasCurrentSubscriptionAccess(subscription),
  ) ?? false;
  const subscriptionAccessError =
    !hasvikAdmin &&
    (subscriptionsQuery.isError ||
      (Boolean(user?.tenantId) && tenantQuery.isError) ||
      (!user?.tenantId && !subscriptionsQuery.isPending));
  const subscriptionAccessPending =
    !hasvikAdmin &&
    authStatus === "authenticated" &&
    (subscriptionsQuery.isPending ||
      (Boolean(user?.tenantId) && tenantQuery.isPending));
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
      pathname !== "/subscriptions" &&
      pathname !== "/tenant-management"
    ) {
      router.replace("/subscriptions");
    }
    if (
      !publicPath &&
      authStatus === "unauthenticated"
    ) {
      router.replace("/");
    }
    if (
      pathname === "/subscriptions" &&
      authStatus === "authenticated" &&
      user &&
      !isTenantAdmin(user) &&
      !isSuperAdmin(user)
    ) {
      router.replace("/businesses");
    }
    if (
      pathname === "/tenant-management" &&
      authStatus === "authenticated" &&
      user &&
      !isSuperAdmin(user) &&
      !isTenantAdmin(user)
    ) {
      router.replace("/businesses");
    }
    if (
      (pathname === "/users" || pathname === "/business-categories") &&
      authStatus === "authenticated" &&
      user &&
      !isTenantAdmin(user) &&
      !isSuperAdmin(user)
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

  if ((!publicPath || pathname === "/") && authStatus === "loading" && !restoreBlocked && sessionQuery.isError) {
    return <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-base font-semibold text-slate-900">Could not restore your session</h1>
      <p className="max-w-md text-sm text-slate-500">{getApiErrorMessage(sessionQuery.error)}</p>
      <button type="button" onClick={() => void sessionQuery.refetch()} disabled={sessionQuery.isFetching} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{sessionQuery.isFetching ? "Retrying..." : "Try again"}</button>
      <button type="button" onClick={() => clearAuth()} className="text-sm text-slate-500 hover:underline">Go to sign in</button>
    </main>;
  }
  if (loggingOut) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Signing out...</main>;
  if (pathname === "/" && ((authStatus === "loading" && !restoreBlocked) || (authStatus === "authenticated" && user))) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Restoring your session...</main>;
  }

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

  if (pathname === "/tenant-management" && !tenantAdmin && !hasvikAdmin) {
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
    } catch {
      // Logout always completes locally; no error toast is shown.
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
  const displayRole = hasvikAdmin ? "SUPER ADMIN" : user?.role || "User";
  const currentTenantName = tenantQuery.data?.name;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#1d4465] bg-[#102b46] text-white shadow-[10px_0_30px_rgba(15,38,61,0.08)] transition-[width] duration-200 lg:flex ${sidebarCollapsed ? "w-[5.5rem]" : "w-72"}`}>
        {/* The brand lockup gives the full mark and compact favicon distinct, intentional homes. */}
        <div className={`flex h-24 items-center ${sidebarCollapsed ? "justify-center px-3" : "px-5"}`}>
          <Link
            href="/dashboard"
            aria-label="Hasvik home"
            className={`group flex items-center transition-colors ${sidebarCollapsed ? "size-14 justify-center rounded-2xl hover:bg-white/10" : "h-16 w-full justify-center rounded-xl hover:bg-white/[0.06]"}`}
          >
            {sidebarCollapsed ? (
              <Image
                src="/icon.png"
                alt="Hasvik icon"
                width={48}
                height={48}
                priority
                className="size-12 object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)]"
              />
            ) : (
              <Image
                src="/logo.png"
                alt="Hasvik"
                width={160}
                height={48}
                priority
                style={{ height: "auto" }}
                className="w-40 drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)]"
              />
            )}
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <div className={`flex flex-1 flex-col justify-between border-t border-white/10 py-7 ${sidebarCollapsed ? "px-3" : "px-4"}`}>
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
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`group relative flex rounded-xl text-xs font-semibold transition-all duration-150 ${sidebarCollapsed ? "flex-col items-center gap-1 px-1.5 py-2.5 text-center" : "items-center gap-3 px-3.5 py-3"} ${
                      active
                        ? "bg-[#1b6d77] text-white shadow-[0_8px_16px_rgba(0,0,0,0.13)]"
                        : "text-[#c4d5e3] hover:bg-white/[0.09] hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`size-[18px] shrink-0 ${active ? "text-[#77e4cc]" : "text-[#9fb9cd] group-hover:text-white"}`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className={sidebarCollapsed ? "text-[9px] leading-3" : ""}>{item.label}</span>
                    {active && !sidebarCollapsed && <span className="ml-auto size-1.5 rounded-full bg-[#77e4cc]" />}
                  </Link>
                );
                })}
            </nav>

          </div>

          {/* Sidebar collapse control */}
          <div className="border-t border-white/10 pt-5">
            <button
              type="button"
              aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              title={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              className={`flex w-full items-center rounded-xl p-3 text-[#c4d5e3] transition-colors hover:bg-white/[0.09] hover:text-white ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              {!sidebarCollapsed && <span className="text-xs font-semibold">Collapse sidebar</span>}
            </button>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={sidebarCollapsed ? "lg:pl-[5.5rem]" : "lg:pl-72"}>
        {/* Sticky Header matching screenshot */}
        <header className="sticky top-0 z-20 border-b border-[#e3ebf1] bg-white/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-3 sm:h-20 sm:px-8">
            {/* Left Header Title / Eyebrow */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#64748b] hover:bg-[#f1f5f9] lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
              <div>
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f879b] sm:block">Hasvik CRM</p>
                <h1 className="max-w-[52vw] truncate text-lg font-bold tracking-tight text-[#102b46] sm:mt-0.5 sm:max-w-none sm:text-2xl">
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

        </header>

        {mobileMenuOpen && (
          <>
            <button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[1px] lg:hidden" />
            <nav
              className="fixed inset-y-0 left-0 z-40 flex w-[min(20rem,88vw)] flex-col overflow-y-auto bg-[#102b46] px-4 py-5 text-white shadow-2xl lg:hidden"
              aria-label="Mobile navigation"
            >
              <div className="mb-6 flex h-16 shrink-0 items-center justify-between border-b border-white/10 pb-4">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex h-12 w-44 items-center rounded-xl bg-white px-4 shadow-lg">
                  <Image src="/logo.png" alt="Hasvik" width={120} height={36} className="h-auto w-28" />
                </Link>
                <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="flex size-10 items-center justify-center text-white/80 hover:bg-white/10 hover:text-white"><X className="size-5" /></button>
              </div>
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8eabc2]">Workspace</p>
              <div className="min-h-0 flex-1 overflow-y-auto">
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
                      className={`mb-1.5 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold ${
                        active
                          ? "bg-[#1b6d77] text-white"
                          : "text-[#c4d5e3] hover:bg-white/[0.09] hover:text-white"
                      }`}
                    >
                      <Icon className={`size-[18px] ${active ? "text-[#77e4cc]" : "text-[#9fb9cd]"}`} />
                      {item.label}
                    </Link>
                  );
                  })}
              </div>
            </nav>
          </>
        )}

        <main className="min-h-[calc(100vh-4rem)] px-3 py-4 sm:min-h-[calc(100vh-5rem)] sm:px-5 sm:py-5 lg:px-7 lg:py-6">
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
                    ? user?.tenantId
                      ? "We couldn’t verify your workspace subscription. Please try again shortly or contact your workspace administrator."
                      : "Your account is missing a workspace ID. Contact your workspace administrator to restore access."
                    : "Your workspace does not currently have an active subscription. Contact your workspace administrator to choose or renew a plan."}
                </p>
                {subscriptionsQuery.isError && (
                  <p className="mt-3 text-xs text-rose-700">
                    {getApiErrorMessage(subscriptionsQuery.error)}
                  </p>
                )}
                {tenantQuery.isError && (
                  <p className="mt-3 text-xs text-rose-700">
                    {getApiErrorMessage(tenantQuery.error)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    void subscriptionsQuery.refetch();
                    if (tenantQuery.isError) void tenantQuery.refetch();
                  }}
                  className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary/90"
                >
                  Try again
                </button>
              </section>
            ) : subscriptionAccessBlocked &&
              tenantAdmin &&
              pathname !== "/subscriptions" &&
              pathname !== "/tenant-management" ? (
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
                        ? user?.tenantId
                          ? "We couldn’t verify your workspace subscription. Refresh the page or contact support before continuing."
                          : "Your account is missing a workspace ID. Contact your workspace administrator to restore access."
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
