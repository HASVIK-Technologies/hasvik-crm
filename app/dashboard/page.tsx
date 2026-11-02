"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import DashboardViewSwitcher from "@/components/dashboard/DashboardViewSwitcher";
import PlatformDashboard from "@/components/dashboard/PlatformDashboard";
import WorkspaceDashboard from "@/components/dashboard/WorkspaceDashboard";
import { dashboardConfig } from "@/lib/dashboard/model";
import { useAuthStore } from "@/store/auth-store";
import { isSuperAdmin } from "@/types/auth";

export default function HomeDashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const user = useAuthStore((state) => state.user);
  const [now] = useState(() => new Date());
  const searchParams = useSearchParams();

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

  const superAdmin = isSuperAdmin(user);
  const adminView = superAdmin && searchParams.get("view") === "admin";
  const viewSwitcher = superAdmin
    ? <DashboardViewSwitcher activeView={adminView ? "admin" : "platform"} />
    : undefined;

  return (
    <PageContainer>
      {adminView
        ? <WorkspaceDashboard user={user} viewSwitcher={viewSwitcher} />
        : superAdmin
          ? <PlatformDashboard user={user} now={now} viewSwitcher={viewSwitcher} />
          : <WorkspaceDashboard user={user} />}
    </PageContainer>
  );
}
