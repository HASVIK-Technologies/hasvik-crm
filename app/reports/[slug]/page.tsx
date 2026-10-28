"use client";

import { Suspense, use } from "react";
import { notFound } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import ReportView from "@/components/reports/ReportView";
import { reportMeta } from "@/lib/reports/definitions";

export default function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const meta = reportMeta(slug);
  if (!meta) notFound();
  return (
    <PageContainer>
      <Suspense fallback={<div className="skeleton h-64" role="status" aria-label="Loading report" />}>
        <ReportView meta={meta} />
      </Suspense>
    </PageContainer>
  );
}
