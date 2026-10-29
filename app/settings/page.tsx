"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Building2, ChevronLeft, ChevronRight, Lock, Palette, UserRound, type LucideIcon } from "lucide-react";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import CompanySettings from "@/components/settings/CompanySettings";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import PageContainer from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { isSuperAdmin, isTenantAdmin } from "@/types/auth";
import { cn } from "@/lib/utils";

type TabId = "profile" | "security" | "appearance" | "company";

interface Tab {
  id: TabId;
  label: string;
  description: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const TABS: Tab[] = [
  { id: "profile", label: "Profile", description: "Your name and contact details", icon: UserRound },
  { id: "security", label: "Security", description: "Password and signing out", icon: Lock },
  { id: "appearance", label: "Appearance", description: "Light, dark or system", icon: Palette },
  { id: "company", label: "Company details", description: "Workspace name and contacts", icon: Building2, adminOnly: true },
];

function SettingsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const admin = isTenantAdmin(user) || isSuperAdmin(user);
  const tabs = TABS.filter((tab) => !tab.adminOnly || admin);
  const requested = params.get("tab") as TabId | null;
  const active = requested ? tabs.find((tab) => tab.id === requested) : undefined;
  const open = (id: TabId | null) => router.replace(id ? `/settings?tab=${id}` : "/settings", { scroll: false });
  // Desktop always shows a section; phones show the list until one is chosen.
  const current = active ?? tabs[0];

  return (
    <PageContainer className="space-y-5">
      <div className="fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account and how the app looks.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className={cn("space-y-2", active && "hidden lg:block")}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = current.id === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => open(tab.id)} aria-current={selected ? "page" : undefined}
                className={cn("flex min-h-16 w-full items-center gap-3 rounded-2xl border px-4 text-left transition-colors", selected ? "lg:border-brand lg:bg-brand-soft" : "", "border-line bg-surface hover:border-brand/50")}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand-strong"><Icon className="size-5" aria-hidden /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">{tab.label}</span><span className="block truncate text-xs text-muted">{tab.description}</span></span>
                <ChevronRight className="size-4 shrink-0 text-muted lg:hidden" aria-hidden />
              </button>
            );
          })}
        </nav>

        <section aria-label={current.label} className={cn(!active && "hidden lg:block")}>
          <button type="button" onClick={() => open(null)} className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-strong lg:hidden"><ChevronLeft className="size-4" aria-hidden />Settings</button>
          <Card className="p-5 sm:p-7">
            <h2 className="mb-5 text-lg font-bold tracking-tight text-ink">{current.label}</h2>
            {current.id === "profile" && <ProfileSettings />}
            {current.id === "security" && <SecuritySettings />}
            {current.id === "appearance" && <AppearanceSettings />}
            {current.id === "company" && <CompanySettings />}
          </Card>
        </section>
      </div>
    </PageContainer>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="skeleton h-64" role="status" aria-label="Loading settings" />}>
      <SettingsContent />
    </Suspense>
  );
}
