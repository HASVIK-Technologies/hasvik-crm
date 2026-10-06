"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CalendarCheck2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthSession, useLogout, useTokenRefresh } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
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
];

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
  if (basePath === "/businesses" || basePath === "/follow-ups") {
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  }
  return pathname === basePath;
}

function getPageDetails(pathname: string) {
  if (pathname === "/follow-ups") {
    return { title: "Follow-ups" };
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
  const sessionQuery = useAuthSession(pathname !== "/");
  useTokenRefresh();
  const logoutMutation = useLogout();
  const authStatus = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const pageDetailsForPath = getPageDetails(pathname);

  useEffect(() => {
    if (pathname === "/" && authStatus === "authenticated") router.replace("/businesses");
    if (
      pathname !== "/" &&
      (sessionQuery.isError ||
        (authStatus === "unauthenticated" && !sessionQuery.isPending))
    ) {
      clearAuth();
      router.replace("/");
    }
  }, [
    authStatus,
    clearAuth,
    pathname,
    router,
    sessionQuery.isError,
    sessionQuery.isPending,
  ]);

  if (pathname === "/") {
    return <>{children}</>;
  }

  if (authStatus !== "authenticated" || sessionQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Restoring your session...
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
              {navigation.map((item) => {
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label="Open user menu" className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary">
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-xs font-bold text-[#0f172a]">{displayName}</p>
                    <p className="truncate text-[11px] text-[#94a3b8]">{user?.email}</p>
                    <p className="mt-1 text-[11px] text-[#64748b]">{displayRole}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void handleLogout()} className="cursor-pointer text-xs text-[#b91c1c]">
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
              {navigation.map((item) => {
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
          <div className="mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
