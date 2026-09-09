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
      content={<BusinessForm />}
    />
  );
}
