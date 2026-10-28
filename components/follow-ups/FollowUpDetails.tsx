"use client";

import type { ReactNode } from "react";
import { Bell, CalendarClock, FileText, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PhoneActionMenu, WhatsAppActionMenu, EmailAction, MeetingJoinAction } from "@/components/common/ContactActionMenu";
import BusinessDetailsMap from "@/components/business-details/BusinessDetailsMap";
import { getLocationData } from "@/lib/business/location";
import RecordLink from "@/components/common/RecordLink";
import EntityActivity from "@/components/common/EntityActivity";
import { isFollowUpReadOnly } from "@/lib/follow-ups/actions";
import { StatusBadge } from "@/components/common/StatusBadge";
import BusinessDetailsContacts from "@/components/business-details/BusinessDetailsContacts";
import { FollowUpNotes } from "@/components/follow-ups/FollowUpNotes";
import { useBusinessQuery } from "@/hooks/use-businesses";
import { formatFollowUpType } from "@/lib/business/form-options";
import type { FollowUpItem } from "@/types/follow-up";

function dateTime(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

interface FollowUpDetailsProps {
  followUp: FollowUpItem;
}

export default function FollowUpDetails({ followUp }: FollowUpDetailsProps) {
  const { data: businessData } = useBusinessQuery(followUp.businessId);
  const contactBusiness = {
    ...businessData,
    phone: businessData?.phone || followUp.businessCallingNumber || followUp.businessPhone,
    alternatePhone: businessData?.alternatePhone || followUp.businessWhatsappNumber,
    email: businessData?.email || followUp.businessEmail,
    phoneNumbers: businessData?.phoneNumbers?.length ? businessData.phoneNumbers : followUp.businessPhoneNumbers,
    whatsappNumbers: businessData?.whatsappNumbers?.length ? businessData.whatsappNumbers : followUp.businessWhatsappNumbers,
  };
  const city = businessData?.city || followUp.businessCity;
  const businessName = businessData?.name || followUp.businessName || "Business";
  const initials = businessName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const isInactive = businessData?.isActive === false || businessData?.status === "Inactive";
  const locationAvailable = getLocationData(businessData ?? {}).isAvailable;
  const reminder = followUp.reminder || (followUp.reminderInMinutes != null
    ? followUp.reminderInMinutes === 0 ? "No reminder set" : `${followUp.reminderInMinutes} minutes before`
    : "No reminder set");

  return (
    <div className="space-y-5">
      <section aria-labelledby="follow-up-heading" className="overflow-hidden border border-line bg-surface shadow-card rounded-2xl">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:p-6 sm:px-7">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <Avatar aria-hidden="true" className="size-13 shrink-0 rounded-xl sm:size-16 sm:rounded-2xl"><AvatarFallback className="bg-btn/10 text-base font-semibold text-brand-strong sm:text-xl">{initials}</AvatarFallback></Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 id="follow-up-heading" className="break-words text-lg font-bold tracking-tight text-ink sm:text-2xl [overflow-wrap:anywhere]">{businessName}</h1>
                <StatusBadge status={followUp.status} />
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted sm:text-sm"><CalendarClock className="size-4 shrink-0 text-muted" /><span>{formatFollowUpType(followUp.type)} follow-up</span>{city && <><span aria-hidden="true">?</span><span>{city}</span></>}</p>
              {followUp.businessId && <RecordLink href={`/businesses/${followUp.businessId}`} className="mt-2 inline-block text-xs font-semibold">View business details</RecordLink>}
            </div>
          </div>
          {!isInactive && !isFollowUpReadOnly(followUp) && <div aria-label="Quick contact actions" className="flex items-center gap-2 self-end sm:self-auto">
            <PhoneActionMenu numbers={contactBusiness.phoneNumbers} fallback={contactBusiness.phone} />
            <WhatsAppActionMenu numbers={contactBusiness.whatsappNumbers} fallback={contactBusiness.alternatePhone} />
            <EmailAction email={contactBusiness.email} />
            {String(followUp.type).toUpperCase() === "MEETING" && followUp.meetingLink && <MeetingJoinAction href={followUp.meetingLink} />}
          </div>}
        </div>
        <dl className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          <SummaryItem icon={<CalendarClock className="size-4" />} label="Scheduled for">
            <time dateTime={Number.isNaN(Date.parse(followUp.scheduledAt)) ? undefined : followUp.scheduledAt}>{dateTime(followUp.scheduledAt)}</time>
          </SummaryItem>
          <SummaryItem icon={<UserRound className="size-4" />} label="Owner">{followUp.assignedToName || "Unassigned"}</SummaryItem>
          <SummaryItem icon={<Bell className="size-4" />} label="Reminder">{reminder}</SummaryItem>
          <SummaryItem icon={<FileText className="size-4" />} label="Follow-up type">{formatFollowUpType(followUp.type)}</SummaryItem>
        </dl>
      </section>

      <section aria-label="Follow-up workspace" className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <div className="[&>section]:rounded-xl [&>section]:border-line [&>section]:shadow-card"><FollowUpNotes key={followUp.id} followUpId={followUp.id} readOnly={!businessData || isInactive || isFollowUpReadOnly(followUp)} /></div>
          <EntityActivity entityType="FOLLOWUP" entityId={followUp.id} />
        </div>
        <aside aria-label="Follow-up reference information" className="min-w-0 space-y-6">
          <BusinessDetailsContacts business={{ ...contactBusiness, isActive: isInactive || isFollowUpReadOnly(followUp) ? false : contactBusiness.isActive }} />
          {locationAvailable && <section aria-label="Business location"><BusinessDetailsMap business={businessData} /></section>}
        </aside>
      </section>
    </div>
  );
}

function SummaryItem({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2/80 p-3.5">
      <dt className="flex items-center gap-2 text-xs text-muted"><span aria-hidden="true" className="text-muted">{icon}</span>{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-ink">{children}</dd>
    </div>
  );
}
