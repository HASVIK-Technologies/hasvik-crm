import { Suspense } from "react";
import BusinessForm from "@/components/businesses/BusinessForm";
import Breadcrumb from "@/components/common/Breadcrumb";
import FormsPageLayout from "@/components/layout/FormsPageLayout";

export default function BusinessFormPage() {
  return (
    <FormsPageLayout
      breadcrumb={
        <Breadcrumb
          items={[
            { label: "Businesses", href: "/businesses" },
            { label: "Add Business" },
          ]}
        />
      }
      content={
        <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading form...</div>}>
          <BusinessForm />
        </Suspense>
      }
    />
  );
}
