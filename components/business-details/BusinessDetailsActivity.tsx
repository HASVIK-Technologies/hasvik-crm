"use client";

import EntityActivity from "@/components/common/EntityActivity";

export default function BusinessDetailsActivity({ businessId }: { businessId: string }) {
  return <EntityActivity entityType="BUSINESS" entityId={businessId} />;
}
