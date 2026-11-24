"use client";

import EntityActivity from "@/components/common/EntityActivity";
import { BUSINESS_PROFILE_FIELDS, hasBusinessProfileFields } from "@/lib/business/lead-type";

export default function BusinessDetailsActivity({ businessId, categoryName }: { businessId: string; categoryName?: string }) {
  // An individual's history never mentions a website or description.
  const hiddenFields = hasBusinessProfileFields(categoryName) ? undefined : BUSINESS_PROFILE_FIELDS;
  return <EntityActivity entityType="BUSINESS" entityId={businessId} hiddenFields={hiddenFields} />;
}
