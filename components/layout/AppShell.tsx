"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarCheck2,
  ChevronDown,
  CircleHelp,
  Home,
  Menu,
  Search,
  Settings,
  SlidersHorizontal,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Businesses", href: "/businesses", icon: Building2 },
  { label: "Follow-ups", href: "/dashboard#follow-ups", icon: CalendarCheck2 },
  { label: "Contacts", href: "/businesses#contacts", icon: UsersRound },
];

const toolNavigation = [
  { label: "Help center", href: "/dashboard#help", icon: CircleHelp },
  { label: "Settings", href: "/dashboard#settings", icon: Settings },
];

const pageDetails: Record<
  string,
  { eyebrow: string; title: string; subtitle?: string }
> = {
  "/dashboard": {
    eyebrow: "Overview",
    title: "Good morning, Amit",
    subtitle: "Here is what is happening across your business today.",
  },
  "/businesses": {
    eyebrow: "BUSINESSES",
    title: "All Businesses",
    subtitle: "Manage and track all your business leads in one place.",
  },
};

function isActivePath(pathname: string, href: string) {
  const basePath = href.split("#")[0];
  if (basePath === "/businesses") {
    return pathname.startsWith("/businesses");
  }
  return pathname === basePath;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPage =
    pageDetails[pathname] ??
    pageDetails["/businesses"] ??
    pageDetails["/dashboard"];

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      {/* Sidebar for Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#e4ecf2] bg-white lg:flex">
        {/* Brand Logo Header */}
        <div className="flex h-20 items-center border-b border-[#f1f5f9] px-6">
          <Link href="/dashboard" aria-label="Hasvik home">
            <Image
              src="/logo.png"
              alt="Hasvik"
              width={140}
              height={42}
              priority
              className="h-auto w-32"
            />
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-1 flex-col justify-between px-4 py-6">
          <div>
            {/* MAIN MENU */}
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
              Main menu
            </p>
            <nav className="mt-3 space-y-1.5" aria-label="Main navigation">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      active
                        ? "bg-[#ecfdf3] text-[#027a48]"
                        : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                    }`}
                  >
                    <Icon
                      className="size-4"
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span>{item.label}</span>
                    {item.label === "Follow-ups" && (
                      <span className="ml-auto rounded-full bg-[#d1fadf] px-2 py-0.5 text-[10px] font-bold text-[#027a48]">
                        3
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* TOOLS & SETTINGS */}
            <p className="mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
              Tools & settings
            </p>
            <nav className="mt-3 space-y-1.5" aria-label="Tools navigation">
              {toolNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#64748b] transition-all hover:bg-[#f8fafc] hover:text-[#0f172a]"
                  >
                    <Icon className="size-4" strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Footer */}
          <div className="border-t border-[#f1f5f9] pt-4">
            <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-[#f8fafc]">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#1e293b] text-xs font-bold text-white">
                  N
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#0f172a]">
                    Amit Sharma
                  </p>
                  <p className="truncate text-[11px] text-[#94a3b8]">
                    Administrator
                  </p>
                </div>
              </div>
              <ChevronDown className="size-4 text-[#94a3b8]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
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
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#12b76a]">
                  {currentPage.eyebrow}
                </p>
                <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl">
                  {currentPage.title}
                </h1>
                {currentPage.subtitle && (
                  <p className="hidden text-xs text-[#64748b] sm:block">
                    {currentPage.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right Header Tools: Global Search + Filter + Bell + User */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Header Search Box */}
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Search businesses by name, category, city..."
                  className="h-10 w-72 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] pl-10 pr-4 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0b63e5] focus:bg-white focus:outline-none xl:w-84"
                />
              </div>

              {/* Header Filter Icon Button */}
              <button
                type="button"
                aria-label="Filter"
                className="flex size-10 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
              >
                <SlidersHorizontal className="size-4" />
              </button>

              {/* Notifications Button with Red Dot */}
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex size-10 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
              >
                <Bell className="size-4" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
              </button>

              {/* User Profile in Header */}
              <div className="flex items-center gap-2.5 pl-1 sm:pl-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#e0eafe] text-xs font-bold text-[#2563eb]">
                  AS
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold text-[#0f172a]">
                    Amit Sharma
                  </p>
                  <p className="text-[10px] text-[#94a3b8]">
                    Administrator
                  </p>
                </div>
                <ChevronDown className="hidden size-3.5 text-[#94a3b8] sm:block" />
              </div>
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
                        ? "bg-[#ecfdf3] text-[#027a48]"
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

        <main className="min-h-[calc(100vh-5rem)] px-5 pb-24 pt-7 sm:px-8 lg:px-10 lg:pb-8">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
