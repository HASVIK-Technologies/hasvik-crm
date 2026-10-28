import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Building2, Tags, MapPin, Building, Zap, Globe, Mail, FileText, Target } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActivityStateText } from "@/components/common/ActivityStateText";
import { normalizeHttpUrl } from "@/lib/business/url-validation";
import { useBusinessStatuses } from "@/hooks/use-filter-options";
import { formatLeadStatus } from "@/lib/business/form-options";

interface OverviewProps {
  business: any;
  businessData: any;
}

export default function BusinessDetailsOverview({ business, businessData }: OverviewProps) {
  const { data: statuses = {} } = useBusinessStatuses();
  const isInactive = business?.isActive === false;
  const websiteUrl = business.website
    ? normalizeHttpUrl(business.website)
    : "";

  const rawLeadStatus =
    (business?.leadStatus && business.leadStatus !== "Active" && business.leadStatus !== "Inactive"
      ? business.leadStatus
      : undefined) ||
    (business?.status && business.status !== "Active" && business.status !== "Inactive"
      ? business.status
      : undefined) ||
    business?.leadStatus ||
    businessData?.detailsGrid?.status;

  const leadStatusDisplay = formatLeadStatus(rawLeadStatus, statuses);

  return (
    <div className="border border-line bg-surface p-5 shadow-card sm:p-6">
      <h3 className="mb-6 text-lg font-bold tracking-tight text-ink">Business Information</h3>
      <div className="space-y-5">
        <div className="flex items-start gap-3 text-sm">
          <Building2 className="w-5 h-5 text-muted shrink-0" />
          <div className="w-32 shrink-0 text-muted">Business Name</div>
          <div className="min-w-0 flex-1 truncate text-ink-soft font-medium" title={business.name || businessData.businessInfo.name}>{business.name || businessData.businessInfo.name}</div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Tags className="w-5 h-5 text-muted shrink-0" />
          <div className="w-32 shrink-0 text-muted">Category</div>
          <div className="text-ink-soft font-medium">{business.category || businessData.businessInfo.category}</div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <MapPin className="w-5 h-5 text-muted shrink-0" />
          <div className="w-32 shrink-0 text-muted">Address</div>
          <div className="text-ink-soft font-medium leading-relaxed">{business.address || (business.city ? business.city : "Location not available")}</div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Building className="w-5 h-5 text-muted shrink-0" />
          <div className="w-32 shrink-0 text-muted">City</div>
          <div className="text-ink-soft font-medium">{business.city || businessData.businessInfo.city}</div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Zap className="w-5 h-5 text-muted shrink-0" />
          <div className="w-32 shrink-0 text-muted">Status</div>
          <ActivityStateText active={!isInactive} />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Target className="w-5 h-5 text-muted shrink-0" />
          <div className="w-32 shrink-0 text-muted">Lead Status</div>
          {leadStatusDisplay && leadStatusDisplay !== "-" ? (
            <StatusBadge
              status={rawLeadStatus || leadStatusDisplay}
              label={leadStatusDisplay}
              className="font-medium"
            />
          ) : (
            <span className="font-medium text-ink-soft">-</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Globe className="w-5 h-5 text-muted shrink-0" />
          <div className="w-32 shrink-0 text-muted">Website</div>
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-medium text-brand-strong hover:underline"
            >
              {websiteUrl}
            </a>
          ) : (
            <span className="font-medium text-ink-soft">-</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-5 h-5 text-muted shrink-0" />
          <div className="w-32 shrink-0 text-muted">Email</div>
          {business.email ? (
            <a
              href={`mailto:${business.email}`}
              className="break-all font-medium text-brand-strong hover:underline"
            >
              {business.email}
            </a>
          ) : (
            <span className="font-medium text-ink-soft">-</span>
          )}
        </div>
        <div className="flex items-start gap-3 text-sm">
          <FileText className="w-5 h-5 text-muted shrink-0 mt-0.5" />
          <div className="w-32 shrink-0 text-muted">Description</div>
          <div className="text-ink-soft font-medium leading-relaxed break-words whitespace-pre-line">
            {business.description || businessData?.businessInfo?.description || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
