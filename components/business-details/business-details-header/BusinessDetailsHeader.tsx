import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import PhoneButton from "./PhoneButton";
import { Building2, MapPin } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActivityStateText } from "@/components/common/ActivityStateText";
import OutlinedButton from "@/components/common/OutlinedButton";
import { formatLeadStatus } from "@/lib/business/form-options";
import { getLocationData, openGoogleMapsOnce } from "@/lib/business/location";

// 1. We define the Props so TypeScript knows what data to expect
interface HeaderProps {
  business: any;
  businessData: any;
}

export default function BusinessDetailsHeader({ business, businessData }: HeaderProps) {
  const locationData = getLocationData(business);

  const rawLeadStatus =
    (business?.leadStatus && business.leadStatus !== "Active" && business.leadStatus !== "Inactive"
      ? business.leadStatus
      : undefined) ||
    (business?.status && business.status !== "Active" && business.status !== "Inactive"
      ? business.status
      : undefined) ||
    business?.leadStatus;

  const leadStatusDisplay = formatLeadStatus(rawLeadStatus);

  return (
    <CardHeader className="flex flex-col gap-4 border-b border-line bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:px-7">

      {/* LEFT SIDE: Avatar & Name */}
      <div className="flex min-w-0 w-full flex-1 items-start gap-3 sm:gap-4">
        <Avatar className="size-13 sm:size-16 rounded-xl sm:rounded-2xl shrink-0">
          <AvatarFallback className="bg-btn/10 text-base sm:text-xl font-semibold text-brand-strong">
            {business.initials}
          </AvatarFallback>
        </Avatar>
        <div className="mt-0.5 flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <CardTitle className="min-w-0 max-w-full truncate text-lg font-bold tracking-tight text-ink-soft sm:text-2xl" title={business.name}>{business.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <ActivityStateText active={business.status === "Active"} />
              {leadStatusDisplay && leadStatusDisplay !== "-" && (
                <StatusBadge
                  status={rawLeadStatus || leadStatusDisplay}
                  label={leadStatusDisplay}
                />
              )}
            </div>
          </div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted">
            <Building2 className="size-3.5 sm:size-4 shrink-0 text-muted" />
            <span>{business.category}</span>
            {business.city && (
              <>
                <span className="text-line">/</span>
                <span>{business.city}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">

        {/* Phone Component */}
        <PhoneButton phones={businessData.contactInfo.phones} />

        {/* Maps Button */}
        {locationData.isAvailable ? (
          <OutlinedButton asChild className="h-9 w-9 p-0 flex items-center justify-center text-brand-strong border-line hover:bg-btn/10 cursor-pointer">
            <a
              href={locationData.mapLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View business location on Google Maps"
              title="Open in Maps"
              onClick={(e) => openGoogleMapsOnce(e, locationData.mapLink)}
            >
              <MapPin className="h-4 w-4" />
            </a>
          </OutlinedButton>
        ) : (
          <OutlinedButton
            disabled
            aria-disabled="true"
            aria-label="Location not available"
            title="Location not available"
            className="h-9 w-9 p-0 flex items-center justify-center text-muted border-line opacity-50 cursor-not-allowed"
          >
            <MapPin className="h-4 w-4" />
          </OutlinedButton>
        )}
      </div>

    </CardHeader>
  );
}
