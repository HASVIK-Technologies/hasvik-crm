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
  MoreHorizontal,
  Search,
  Settings,
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

const pageDetails = {
  "/dashboard": {
    eyebrow: "Overview",
    title: "Good morning, Amit",
    description: "Here is what is happening across your business today.",
  },
  "/businesses": {
    eyebrow: "Workspace",
    title: "Businesses",
    description: "Keep every business and contact close at hand.",
  },
};

function isActivePath(pathname: string, href: string) {
  const basePath = href.split("#")[0];
  return (
    pathname === basePath ||
    (basePath !== "/dashboard" && pathname.startsWith(`${basePath}/`))
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPage =
    pageDetails[pathname as keyof typeof pageDetails] ??
    pageDetails["/dashboard"];

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f5f8fa] text-[#163b58]">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#dce8ee] bg-white lg:flex">
        <div className="flex h-20 items-center border-b border-[#edf2f5] px-7">
          <Link href="/dashboard" aria-label="Hasvik home">
            <Image
              src="/logo.png"
              alt="Hasvik"
              width={148}
              height={45}
              priority
              className="h-auto w-37"
            />
          </Link>
        </div>

        <div className="flex flex-1 flex-col px-4 py-7">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a9eaa]">
            Main menu
          </p>
          <nav className="mt-3 space-y-1" aria-label="Main navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${active ? "bg-[#e7f5f0] text-[#08765d]" : "text-[#667f8d] hover:bg-[#f3f8f9] hover:text-[#163b58]"}`}
                >
                  <Icon
                    className="size-[18px]"
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                  {item.label}
                  {item.label === "Follow-ups" && (
                    <span className="ml-auto rounded-full bg-[#dff3eb] px-2 py-0.5 text-[10px] text-[#08765d]">
                      3
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#edf2f5] pt-5">
            <Link
              href="/dashboard#help"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#667f8d] hover:bg-[#f3f8f9] hover:text-[#163b58]"
            >
              <CircleHelp className="size-[18px]" strokeWidth={1.8} />
              Help center
            </Link>
            <Link
              href="/dashboard#settings"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#667f8d] hover:bg-[#f3f8f9] hover:text-[#163b58]"
            >
              <Settings className="size-[18px]" strokeWidth={1.8} />
              Settings
            </Link>
          </div>
        </div>

        <div className="border-t border-[#edf2f5] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[#f5f8fa] p-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#dceafa] text-xs font-bold text-[#1b6493]">
              AS
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#23445d]">
                Amit Sharma
              </p>
              <p className="truncate text-xs text-[#8a9eaa]">Administrator</p>
            </div>
            <ChevronDown className="size-4 text-[#8a9eaa]" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#dce8ee] bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-[#547080] hover:bg-[#f1f6f8] lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#168d6e]">
                  {currentPage.eyebrow}
                </p>
                <h1 className="mt-1 text-lg font-semibold text-[#163b58] sm:text-xl">
                  {currentPage.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-lg border border-[#e2ebef] bg-[#f9fbfc] px-3 py-2 text-sm text-[#8a9eaa] xl:flex">
                <Search className="size-4" />
                Search businesses...
              </div>
              <button
                type="button"
                aria-label="Search"
                className="rounded-lg p-2.5 text-[#547080] hover:bg-[#f1f6f8] xl:hidden"
              >
                <Search className="size-[18px]" />
              </button>
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-lg p-2.5 text-[#547080] hover:bg-[#f1f6f8]"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e46b57]" />
              </button>
              <div className="hidden h-7 w-px bg-[#e5edf0] sm:block" />
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#dceafa] text-xs font-bold text-[#1b6493]">
                  AS
                </div>
                <span className="text-sm font-medium text-[#34586d]">
                  Amit Sharma
                </span>
                <ChevronDown className="size-4 text-[#8a9eaa]" />
              </div>
            </div>
          </div>
          {mobileMenuOpen && (
            <nav
              className="border-t border-[#edf2f5] bg-white px-5 py-3 lg:hidden"
              aria-label="Mobile navigation"
            >
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#547080] hover:bg-[#f1f6f8]"
                  >
                    <Icon className="size-[18px]" />
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

        <footer className="hidden border-t border-[#dce8ee] bg-white px-10 py-5 text-xs text-[#8a9eaa] lg:flex lg:items-center lg:justify-between">
          <span>Hasvik CRM</span>
          <span>Business leads. Simple follow-ups. More sales.</span>
          <span>© 2026 Hasvik</span>
        </footer>
      </div>

      {/* 

      
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex h-18 items-center justify-around border-t border-[#dce8ee] bg-white px-2 shadow-[0_-8px_24px_rgba(30,74,99,0.08)] lg:hidden"
        aria-label="Mobile bottom navigation"
      >
        {navigation.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-w-16 flex-col items-center gap-1 py-2 text-[10px] font-medium ${active ? "text-[#08765d]" : "text-[#8a9eaa]"}`}
            >
              <Icon className="size-[19px]" strokeWidth={active ? 2.4 : 1.8} />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/dashboard#more"
          className="flex min-w-16 flex-col items-center gap-1 py-2 text-[10px] font-medium text-[#8a9eaa]"
        >
          <MoreHorizontal className="size-[19px]" strokeWidth={1.8} />
          More
        </Link>
      </nav> */}
    </div>
  );
}
