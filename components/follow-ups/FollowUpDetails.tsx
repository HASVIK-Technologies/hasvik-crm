"use client";

import {
  Bell,
  CalendarClock,
  FileText,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { FollowUpNotes } from "@/components/follow-ups/FollowUpNotes";
import { useBusinessQuery } from "@/hooks/use-businesses";
import type { FollowUpItem } from "@/types/follow-up";

function dateTime(value: string) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";
}

function initials(value: string) {
  return (
    value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "NB"
  );
}

interface FollowUpDetailsProps {
  followUp: FollowUpItem;
}

const cleanNumber = (num: string) => num.replace(/\D/g, "");

export default function FollowUpDetails({
  followUp,
}: FollowUpDetailsProps) {
  const { data: businessData } = useBusinessQuery(followUp.businessId);

  const callingNumber =
    followUp.businessCallingNumber ||
    businessData?.phone ||
    followUp.businessPhone;

  const whatsappNumber =
    followUp.businessWhatsappNumber ||
    businessData?.alternatePhone;

  const email =
    followUp.businessEmail ||
    businessData?.email;

  const cleanCalling = callingNumber ? cleanNumber(callingNumber) : "";
  const cleanWhatsapp = whatsappNumber ? cleanNumber(whatsappNumber) : "";

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_4px_20px_rgba(20,40,60,0.04)] sm:p-7">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-16 rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
            <AvatarFallback className="bg-transparent text-inherit">
              {initials(followUp.businessName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-xl font-bold tracking-tight text-[#334155] sm:text-2xl">
                {followUp.businessName}
              </h1>
              <StatusBadge
                status={followUp.status}
                className="rounded-md px-2.5 py-1 text-xs"
              />
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-[#64748b]">
              <MapPin className="size-4 text-[#94a3b8]" />
              {followUp.businessCity || "Business location not available"}
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_2px_12px_rgba(20,40,60,0.03)] sm:p-7">
          <h2 className="text-lg font-bold text-[#0f172a]">
            Follow-up overview
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <CalendarClock className="mt-0.5 size-5 text-[#94a3b8]" />
              <div>
                <p className="text-sm text-[#64748b]">Scheduled for</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  {dateTime(followUp.scheduledAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText className="mt-0.5 size-5 text-[#94a3b8]" />
              <div>
                <p className="text-sm text-[#64748b]">Follow-up type</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  {followUp.type}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <UserRound className="mt-0.5 size-5 text-[#94a3b8]" />
              <div>
                <p className="text-sm text-[#64748b]">Assigned to</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  {followUp.assignedToName}
                </p>
              </div>
            </div>
            {/* Reminder Item */}
            <div className="flex gap-3">
              <Bell className="mt-0.5 size-5 text-[#94a3b8]" />
              <div>
                <p className="text-sm text-[#64748b]">Reminder</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  {followUp.reminder || "No reminder set"}
                </p>
              </div>
            </div>
          </div>

        </section>

        <aside className="h-fit rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
            Business contact
          </p>

          <div className="mt-4 space-y-4">
            {/* Calling number */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                Calling number
              </p>
              {callingNumber ? (
                <a
                  href={`tel:${cleanCalling || callingNumber}`}
                  className="mt-1.5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  <Phone className="size-4 shrink-0 text-primary" />
                  <span>{callingNumber}</span>
                </a>
              ) : (
                <p className="mt-1 text-sm text-[#94a3b8]">-</p>
              )}
            </div>

            {/* WhatsApp number */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                WhatsApp number
              </p>
              {whatsappNumber ? (
                <a
                  href={
                    cleanWhatsapp.length === 10
                      ? `https://wa.me/91${cleanWhatsapp}`
                      : `https://wa.me/${cleanWhatsapp}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-2 text-sm font-semibold text-brand-green-strong transition-colors hover:text-brand-green hover:underline"
                >
                  <WhatsAppIcon className="size-4 shrink-0 text-brand-green-strong" />
                  <span>{whatsappNumber}</span>
                </a>
              ) : (
                <p className="mt-1 text-sm text-[#94a3b8]">-</p>
              )}
            </div>

            {/* Email */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                Email
              </p>
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="mt-1.5 inline-flex items-center gap-2 text-sm font-semibold text-[#475569] transition-colors hover:text-[#0f172a] hover:underline"
                >
                  <Mail className="size-4 shrink-0 text-[#64748b]" />
                  <span className="truncate">{email}</span>
                </a>
              ) : (
                <p className="mt-1 text-sm text-[#94a3b8]">-</p>
              )}
            </div>
          </div>
        </aside>
      </div>
      <FollowUpNotes followUpId={followUp.id} />
    </div>
  );
}
