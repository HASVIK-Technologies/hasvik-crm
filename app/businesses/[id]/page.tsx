import { Card } from "@/components/ui/card";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function BusinessDetailsPage() {
  return (
    <div className="flex flex-col gap-5 pt-1">
      <Breadcrumb
        items={[
          { label: "Businesses", href: "/businesses" },
          { label: "Business Details" },
        ]}
      />
      <div className="flex items-center justify-between">
        <Card>Hello</Card>
        <Card>Hello</Card>
      </div>
    </div>
  );
}
