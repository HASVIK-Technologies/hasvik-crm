import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Businesses() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Businesses</h1>
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
