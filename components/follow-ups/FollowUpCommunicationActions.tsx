"use client";

import { MapPin } from "lucide-react";
import { EmailAction, MeetingJoinAction, PhoneActionMenu, WhatsAppActionMenu } from "@/components/common/ContactActionMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getValidLocationUrl } from "@/lib/business/location";
import { isFollowUpReadOnly } from "@/lib/follow-ups/actions";
import { cn } from "@/lib/utils";
import type { FollowUpItem } from "@/types/follow-up";

function VisitLocationAction({ item, className, onAction }: { item: FollowUpItem; className?: string; onAction?: () => void }) {
  const locationUrl = getValidLocationUrl(item.businessLocationUrl);
  const buttonClass = cn(
    "grid size-11 place-items-center rounded-xl border border-transparent sm:size-9",
    locationUrl ? "text-brand-strong hover:bg-brand-soft" : "cursor-not-allowed text-muted opacity-50",
    className,
  );
  const label = locationUrl
    ? `Open ${item.businessName} location on Google Maps`
    : "Location URL not available";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {locationUrl ? (
          <a
            href={locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={buttonClass}
            onClick={(event) => {
              event.stopPropagation();
              onAction?.();
            }}
          >
            <MapPin className="size-4" aria-hidden="true" />
          </a>
        ) : (
          <button type="button" disabled aria-label={label} className={buttonClass}>
            <MapPin className="size-4" aria-hidden="true" />
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default function FollowUpCommunicationActions({ item, className, onAction }: { item: FollowUpItem; className?: string; onAction?: () => void }) {
  const type = String(item.type).toUpperCase();
  if (type === "VISIT") return <VisitLocationAction item={item} className={className} onAction={onAction} />;
  if (isFollowUpReadOnly(item)) return null;
  if (type === "CALL") return <PhoneActionMenu numbers={item.businessPhoneNumbers} fallback={item.businessCallingNumber || item.businessPhone} className={className} onAction={onAction} />;
  if (type === "WHATSAPP") return <WhatsAppActionMenu numbers={item.businessWhatsappNumbers} fallback={item.businessWhatsappNumber} className={className} onAction={onAction} />;
  if (type === "MEETING") return <MeetingJoinAction href={item.meetingLink} className={className} onAction={onAction} />;
  if (type === "EMAIL") return <EmailAction email={item.businessEmail} className={className} onAction={onAction} />;
  return null;
}
