import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BusinessDetailsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="secondary" size="sm">
          Back to Businesses
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <Card>
            Hello
        </Card>
        <Card>
            Hello
        </Card>
      </div>
    </div>
  );
}
