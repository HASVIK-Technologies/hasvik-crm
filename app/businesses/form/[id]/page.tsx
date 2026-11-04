import React, { Suspense } from "react";
import BusinessForm from "@/components/businesses/BusinessForm";
import Breadcrumb from "@/components/common/Breadcrumb";
import FormsPageLayout from "@/components/layout/FormsPageLayout";

interface EditBusinessPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditBusinessPage({ params }: EditBusinessPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  return (
    <FormsPageLayout
      breadcrumb={
        <Breadcrumb
          items={[
            { label: "Leads", href: "/businesses" },
            { label: "Edit Lead" },
          ]}
        />
      }
      content={
        <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading form...</div>}>
          <BusinessForm businessId={id} />
        </Suspense>
      }
    />
  );
}
