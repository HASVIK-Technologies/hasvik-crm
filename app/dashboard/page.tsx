"use client";

import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PlatformDashboard from "@/components/dashboard/PlatformDashboard";
import WorkspaceDashboard from "@/components/dashboard/WorkspaceDashboard";
import { dashboardConfig } from "@/lib/dashboard/model";
import { useAuthStore } from "@/store/auth-store";
import { isSuperAdmin } from "@/types/auth";

export default function HomeDashboard() {
  const user = useAuthStore((state) => state.user);
  const [now] = useState(() => new Date());

  if (!user) return null;
  if (!dashboardConfig(user.role)) {
    return (
      <PageContainer>
        <p role="alert" className="rounded-2xl border border-warn/30 bg-warn-soft p-5 text-sm text-warn">
          A dashboard is not set up for your role yet. Ask your workspace administrator for help.
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      <WorkspaceDashboard user={user} />
      {isSuperAdmin(user) && (
        <section aria-labelledby="platform-heading" className="space-y-4">
          <h2 id="platform-heading" className="text-lg font-bold tracking-tight text-ink">Platform</h2>
          <PlatformDashboard user={user} now={now} />
        </section>
      )}
    </PageContainer>
  );
}
