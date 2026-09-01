import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Businesses() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          asChild
          size="lg"
          className="bg-[#08765d] text-white hover:bg-[#066a53]"
        >
          <Link href="/businesses/form">
            <Plus className="size-4" />
            Add Business
          </Link>
        </Button>
      </div>
      <Card className="overflow-hidden">
        <CardHeader>
          Search Businesses
          {/* <SearchPanel /> */}
        </CardHeader>
        <CardContent>
          Business List
          {/* <BusinessesTable /> */}
        </CardContent>
      </Card>
    </div>
  );
}
