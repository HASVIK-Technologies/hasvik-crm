import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Building2, Tags, MapPin, Building, Zap, Globe, Mail, Target } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
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
    <div className="rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_4px_20px_rgba(20,40,60,0.03)] sm:p-6">
      <h3 className="mb-6 text-lg font-bold tracking-tight text-slate-800">Business Information</h3>
      <div className="space-y-5">
        <div className="flex items-start gap-3 text-sm">
          <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Business Name</div>
          <div className="text-slate-700 font-medium">{business.name || businessData.businessInfo.name}</div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Tags className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Category</div>
          <div className="text-slate-700 font-medium">{business.category || businessData.businessInfo.category}</div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Address</div>
          <div className="text-slate-700 font-medium leading-relaxed">{business.address || (business.city ? business.city : "Location not available")}</div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Building className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">City</div>
          <div className="text-slate-700 font-medium">{business.city || businessData.businessInfo.city}</div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Zap className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Status</div>
          <StatusBadge
            status={isInactive ? "Inactive" : "Active"}
            className="font-medium"
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Target className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Lead Status</div>
          {leadStatusDisplay && leadStatusDisplay !== "-" ? (
            <StatusBadge
              status={rawLeadStatus || leadStatusDisplay}
              label={leadStatusDisplay}
              className="font-medium"
            />
          ) : (
            <span className="font-medium text-slate-700">-</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Globe className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Website</div>
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-medium text-primary hover:underline"
            >
              {websiteUrl}
            </a>
          ) : (
            <span className="font-medium text-slate-700">-</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Email</div>
          {business.email ? (
            <a
              href={`mailto:${business.email}`}
              className="break-all font-medium text-primary hover:underline"
            >
              {business.email}
            </a>
          ) : (
            <span className="font-medium text-slate-700">-</span>
          )}
        </div>
      </div>
    </div>
  );
}