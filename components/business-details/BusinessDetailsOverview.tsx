import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Building2, UserRound, Tags, MapPin, Building, Zap, Globe, Mail, FileText, Target, FolderKanban } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActivityStateText } from "@/components/common/ActivityStateText";
import { normalizeHttpUrl } from "@/lib/business/url-validation";
import { useBusinessStatuses } from "@/hooks/use-filter-options";
import { formatLeadStatus } from "@/lib/business/form-options";
import TagAssignmentPicker from "@/components/tags/TagAssignmentPicker";

interface OverviewProps {
  business: any;
  businessData: any;
}

export default function BusinessDetailsOverview({ business, businessData }: OverviewProps) {
  const { data: statuses = {} } = useBusinessStatuses();
  const isInactive = business?.isActive === false;
  const categoryName: string | undefined = business.category || businessData?.businessInfo?.category;
  const leadKind = getLeadKind(categoryName);
  const isIndividual = leadKind === "individual";
  const NameIcon = isIndividual ? UserRound : Building2;
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
    <div className="border border-[#e4ecf2] bg-white p-5 shadow-[0_4px_20px_rgba(20,40,60,0.03)] sm:p-6">
      <h3 className="mb-6 text-lg font-bold tracking-tight text-slate-800">Lead Information</h3>
      <div className="grid grid-cols-1 gap-x-5 gap-y-4">
        <div aria-label="Business name" className="flex min-w-0 items-start gap-3 text-sm">
          <Building2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0 font-medium text-slate-700 break-words" title={business.name || businessData.businessInfo.name}>{business.name || businessData.businessInfo.name}</div>
        </div>
        <div aria-label="Category" className="flex min-w-0 items-start gap-3 text-sm">
          <FolderKanban aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0 font-medium text-slate-700 break-words">{business.category || businessData.businessInfo.category}</div>
        </div>
        <div aria-label="Tags" className="flex min-w-0 items-start gap-3 text-sm">
          <Tags aria-hidden="true" className="mt-1 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0"><TagAssignmentPicker entity="BUSINESS" entityId={String(business.id ?? business._id ?? "")} tags={business.tags ?? []} variant="details" /></div>
        </div>
        <div aria-label="Address" className="flex min-w-0 items-start gap-3 text-sm">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0 font-medium leading-relaxed text-slate-700 break-words">{business.address || (business.city ? business.city : "Location not available")}</div>
        </div>
        <div aria-label="City" className="flex min-w-0 items-start gap-3 text-sm">
          <Building aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0 font-medium text-slate-700 break-words">{business.city || businessData.businessInfo.city}</div>
        </div>
        <div aria-label="Business status" className="flex min-w-0 items-start gap-3 text-sm">
          <Zap aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <ActivityStateText active={!isInactive} />
        </div>
        <div aria-label="Lead status" className="flex min-w-0 items-start gap-3 text-sm">
          <Target aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
          {leadStatusDisplay && leadStatusDisplay !== "-" ? (
            <StatusBadge status={rawLeadStatus || leadStatusDisplay} label={leadStatusDisplay} className="font-medium" />
          ) : <span className="font-medium text-slate-700">-</span>}
        </div>
        {!isIndividual && (
          <div aria-label="Website" className="flex min-w-0 items-start gap-3 text-sm">
            <Globe aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
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
        )}
        </div>
        <div aria-label="Email" className="flex min-w-0 items-start gap-3 text-sm">
          <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0">
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
        {!isIndividual && (
          <div className="flex items-start min-w-0 gap-3 text-sm">
            <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div className="w-32 shrink-0 text-slate-500">Description</div>
            <div className="text-slate-700 font-medium leading-relaxed break-words whitespace-pre-line">
              {business.description || businessData?.businessInfo?.description || "-"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
