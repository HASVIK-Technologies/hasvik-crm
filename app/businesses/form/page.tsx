import BusinessForm from "@/components/businesses/BusinessForm";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function BusinessFormPage() {
  return (
    <div className="flex flex-col gap-5 pt-1">
      <Breadcrumb
        items={[
          { label: "Businesses", href: "/businesses" },
          { label: "Add Business" },
        ]}
      />
      <BusinessForm />
    </div>
  );
}
