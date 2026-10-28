"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CreditCard,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthSession, useLogout, useTokenRefresh } from "@/hooks/use-auth";
import { useTenantQuery } from "@/hooks/use-tenants";
import { useSubscriptionsQuery } from "@/hooks/use-subscriptions";
import { useAuthStore } from "@/store/auth-store";
import { isSuperAdmin, isTenantAdmin } from "@/types/auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { getSubscriptionTenantId, hasCurrentSubscriptionAccess } from "@/lib/subscriptions/access";
import { isActivePath, navigation, pageTitle, visibleNavigation } from "@/lib/navigation/items";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CommandPalette from "@/components/common/CommandPalette";
import ThemeToggle from "@/components/common/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/explore-crm" || pathname === "/tenant";
}

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-6 text-center text-sm text-muted">
      <span role="status" className="flex items-center gap-3">
        <span aria-hidden className="size-5 animate-spin rounded-full border-2 border-line border-t-brand" />
        {children}
      </span>
    </main>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
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

  // Pages the signed-in role may not open (hidden in the menu and blocked here as well).
  const routeBlocked = Boolean(
    user &&
      authStatus === "authenticated" &&
      navigation.some((item) => isActivePath(pathname, item.href) && item.visible && !item.visible(user)),
  );

  useEffect(() => {
    if (pathname === "/" && authStatus === "authenticated" && user) {
      const signupWelcome =
        new URLSearchParams(window.location.search).get("welcome") ===
        "subscription";
      router.replace(
        signupWelcome && tenantAdmin ? "/subscriptions" : "/dashboard",
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
    if (!publicPath && authStatus === "unauthenticated") {
      router.replace("/");
    }
    if (routeBlocked) {
      router.replace("/businesses");
    }
  }, [
    authStatus,
    clearAuth,
    pathname,
    publicPath,
    router,
    routeBlocked,
    sessionQuery.isError,
    sessionQuery.isPending,
    hasvikAdmin,
    tenantAdmin,
    subscriptionAccessBlocked,
    user,
  ]);

  // Ctrl/Cmd+K opens the command palette from anywhere in the signed-in app.
  useEffect(() => {
    if (publicPath) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [publicPath]);

  if ((!publicPath || pathname === "/") && authStatus === "loading" && !restoreBlocked && sessionQuery.isError) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
        <h1 className="text-lg font-bold text-ink">We couldn&apos;t restore your session</h1>
        <p className="max-w-md text-sm text-muted">{getApiErrorMessage(sessionQuery.error)}</p>
        <Button onClick={() => void sessionQuery.refetch()} loading={sessionQuery.isFetching}>Try again</Button>
        <Button variant="ghost" onClick={() => clearAuth()}>Go to sign in</Button>
      </main>
    );
  }
  if (loggingOut) return <FullScreenMessage>Signing you out…</FullScreenMessage>;
  if (pathname === "/" && ((authStatus === "loading" && !restoreBlocked) || (authStatus === "authenticated" && user))) {
    return <FullScreenMessage>Opening your workspace…</FullScreenMessage>;
  }

  if (publicPath) {
    return <>{children}</>;
  }

  if (authStatus !== "authenticated" || sessionQuery.isPending) {
    return <FullScreenMessage>Opening your workspace…</FullScreenMessage>;
  }

  if (routeBlocked) {
    return <FullScreenMessage>Taking you to a page you can open…</FullScreenMessage>;
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

  const items = visibleNavigation(user);
  const primaryItems = items.filter((item) => item.primary);
  const moreItems = items.filter((item) => !item.primary);
  const moreActive = moreItems.some((item) => isActivePath(pathname, item.href));
  const displayName = user?.fullName || user?.email || "HASVIK user";
  const displayRole = hasvikAdmin ? "Super admin" : (user?.role || "User").toLowerCase().replace(/^./, (c) => c.toUpperCase());
  const currentTenantName = tenantQuery.data?.name;
  const initials = displayName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const navLink = (item: (typeof items)[number], compact = false) => {
    const Icon = item.icon;
    const active = isActivePath(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        title={compact ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex min-h-11 items-center rounded-xl text-sm font-semibold transition-colors",
          compact ? "justify-center px-0" : "gap-3 px-3.5",
          active ? "bg-brand-soft text-brand-strong" : "text-ink-soft hover:bg-surface-2 hover:text-ink",
        )}
      >
        {active && !compact && <span aria-hidden className="absolute top-2.5 bottom-2.5 left-0 w-1 rounded-r-full bg-brand" />}
        <Icon className="size-5 shrink-0" strokeWidth={active ? 2.4 : 2} aria-hidden />
        {compact ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-dvh text-ink">
      <a href="#main" className="sr-only z-[100] rounded-lg bg-btn px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Skip to content</a>

      {/* Desktop sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex", sidebarCollapsed ? "w-[4.75rem]" : "w-64")}>
        <div className={cn("flex h-16 shrink-0 items-center", sidebarCollapsed ? "justify-center" : "px-5")}>
          <Link href="/dashboard" aria-label="HASVIK CRM home" className="flex items-center">
            {sidebarCollapsed ? (
              <Image src="/hasvik-icon.png" alt="HASVIK" width={40} height={40} priority className="size-9" />
            ) : (
              <Image src="/hasvik-logo.png" alt="HASVIK" width={512} height={171} priority className="h-10 w-auto dark:rounded-lg dark:bg-white dark:px-2" />
            )}
          </Link>
        </div>
        <div aria-hidden className="brand-bar h-0.5 shrink-0 opacity-70" />
        <nav aria-label="Main navigation" className={cn("flex-1 space-y-1 overflow-y-auto py-4", sidebarCollapsed ? "px-3" : "px-3")}>
          {items.map((item) => navLink(item, sidebarCollapsed))}
        </nav>
        <div className="border-t border-line p-3">
          <button
            type="button"
            aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className={cn("flex min-h-11 w-full items-center rounded-xl text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink", sidebarCollapsed ? "justify-center" : "gap-3 px-3.5")}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="size-5" aria-hidden /> : <PanelLeftClose className="size-5" aria-hidden />}
            {!sidebarCollapsed && "Collapse"}
          </button>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-200", sidebarCollapsed ? "lg:pl-[4.75rem]" : "lg:pl-64")}>
        <header className="glass sticky top-0 z-20 border-b border-line">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/dashboard" aria-label="HASVIK CRM home" className="lg:hidden">
                <Image src="/hasvik-icon.png" alt="HASVIK" width={40} height={40} className="size-9" />
              </Link>
              <p className="truncate text-base font-bold tracking-tight text-ink sm:text-lg" aria-live="polite">{pageTitle(pathname)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label="Search pages and businesses"
                className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-brand/50 hover:bg-surface-2 sm:h-10 sm:w-auto sm:min-w-56 sm:justify-start sm:gap-2 sm:px-3 sm:text-muted"
              >
                <Search className="size-4" aria-hidden />
                <span className="hidden flex-1 text-left text-sm sm:block">Search…</span>
                <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[11px] font-semibold md:block">Ctrl K</kbd>
              </button>
              {!hasvikAdmin && currentTenantName && (
                <span className="hidden max-w-48 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs font-semibold text-ink-soft xl:flex" title={currentTenantName}>
                  <Building2 className="size-4 shrink-0 text-brand-strong" aria-hidden />
                  <span className="truncate">{currentTenantName}</span>
                </span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label="Open user menu" className="flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-(--ring) sm:size-10">
                    <Avatar className="size-10 bg-btn text-white sm:size-9">
                      <AvatarFallback className="bg-btn text-xs font-bold text-white">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-72 rounded-2xl p-2">
                  <DropdownMenuLabel className="rounded-xl bg-surface-2 p-3 font-normal">
                    <p className="truncate text-sm font-bold text-ink">{displayName}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{user?.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[11px] font-semibold text-brand-strong"><ShieldCheck className="size-3" aria-hidden />{displayRole}</span>
                      {currentTenantName && !hasvikAdmin && (
                        <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-surface px-2 py-1 text-[11px] font-semibold text-ink-soft ring-1 ring-line"><Building2 className="size-3 shrink-0" aria-hidden /><span className="truncate">{currentTenantName}</span></span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <div className="px-1 py-2"><ThemeToggle className="w-full [&>button]:flex-1" /></div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="min-h-11 cursor-pointer text-sm font-medium">
                    <Link href="/settings"><Settings2 className="mr-2 size-4 text-muted" aria-hidden />Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={logoutMutation.isPending} onClick={() => void handleLogout()} className="min-h-11 cursor-pointer text-sm font-semibold text-bad focus:bg-bad-soft focus:text-bad">
                    <LogOut className="mr-2 size-4" aria-hidden />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main id="main" className="min-h-[calc(100dvh-3.5rem)] px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:pb-10">
          <div className="mx-auto w-full max-w-[1600px]">
            {subscriptionAccessPending ? (
              <div role="status" className="space-y-4" aria-label="Checking workspace subscription">
                <div className="skeleton h-9 w-56" />
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)}</div>
                <div className="skeleton h-72" />
              </div>
            ) : subscriptionAccessBlocked && !tenantAdmin ? (
              <section className="mx-auto mt-8 w-full max-w-lg rounded-3xl border border-warn/30 bg-surface p-7 text-center shadow-pop sm:p-9">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-warn-soft text-warn"><CreditCard className="size-5" aria-hidden /></span>
                <h1 className="mt-4 text-lg font-bold text-ink">Workspace subscription required</h1>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  {subscriptionAccessError
                    ? user?.tenantId
                      ? "We couldn’t verify your workspace subscription. Please try again shortly or contact your workspace administrator."
                      : "Your account is missing a workspace ID. Contact your workspace administrator to restore access."
                    : "Your workspace does not currently have an active subscription. Contact your workspace administrator to choose or renew a plan."}
                </p>
                {subscriptionsQuery.isError && <p className="mt-3 text-xs text-bad">{getApiErrorMessage(subscriptionsQuery.error)}</p>}
                {tenantQuery.isError && <p className="mt-3 text-xs text-bad">{getApiErrorMessage(tenantQuery.error)}</p>}
                <Button
                  className="mt-5"
                  onClick={() => {
                    void subscriptionsQuery.refetch();
                    if (tenantQuery.isError) void tenantQuery.refetch();
                  }}
                >
                  Try again
                </Button>
              </section>
            ) : subscriptionAccessBlocked && tenantAdmin && pathname !== "/subscriptions" && pathname !== "/tenant-management" ? (
              <div role="status" className="flex min-h-64 items-center justify-center text-sm text-muted">Taking you to subscription management…</div>
            ) : (
              <>
                {subscriptionAccessBlocked && tenantAdmin && pathname === "/subscriptions" && (
                  <div
                    role={subscriptionAccessError ? "alert" : "status"}
                    className={cn("mb-5 rounded-2xl border px-4 py-3 text-sm leading-6", subscriptionAccessError ? "border-bad/30 bg-bad-soft text-bad" : "border-warn/30 bg-warn-soft text-warn")}
                  >
                    {subscriptionAccessError
                      ? user?.tenantId
                        ? "We couldn’t verify your workspace subscription. Refresh the page or contact support before continuing."
                        : "Your account is missing a workspace ID. Contact your workspace administrator to restore access."
                      : "Your workspace does not have an active subscription. Choose a plan or wait for HASVIK admin approval; other workspace pages stay unavailable until access is active."}
                  </div>
                )}
                {children}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Phone bottom tab bar */}
      <nav aria-label="Primary" className="glass fixed inset-x-0 bottom-0 z-30 border-t border-line pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="mx-auto flex max-w-xl items-stretch justify-around">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors", active ? "text-brand-strong" : "text-muted")}>
                  <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-brand-soft")}><Icon className="size-5" aria-hidden /></span>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" className={cn("flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors", moreActive ? "text-brand-strong" : "text-muted")}>
              <span className={cn("grid h-7 w-12 place-items-center rounded-full", moreActive && "bg-brand-soft")}><MoreHorizontal className="size-5" aria-hidden /></span>
              More
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-ink/55 backdrop-blur-[3px] lg:hidden" onMouseDown={(event) => event.target === event.currentTarget && setMoreOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="More pages" className="sheet-up max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-float">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">More</h2>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Close" className="grid size-11 place-items-center rounded-xl text-muted hover:bg-surface-2"><X className="size-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className={cn("flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 text-sm font-semibold", active ? "border-brand bg-brand-soft text-brand-strong" : "border-line bg-surface-2 text-ink")}>
                    <Icon className="size-5 shrink-0" aria-hidden />{item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 space-y-3 border-t border-line pt-4">
              <ThemeToggle className="w-full [&>button]:flex-1" />
              <Button variant="outline" className="w-full text-bad" onClick={() => void handleLogout()} loading={logoutMutation.isPending}><LogOut className="size-4" aria-hidden />Sign out</Button>
            </div>
          </div>
        </div>
      )}

      {paletteOpen && <CommandPalette open onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}
