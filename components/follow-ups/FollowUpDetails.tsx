"use client";

import {
  Bell,
  CalendarClock,
  CheckCircle2,
  FileText,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { FollowUpItem } from "@/types/follow-up";

function statusClass(status: string) {
  if (status === "COMPLETED") return "bg-[#ecfdf3] text-[#027a48]";
  if (status === "CANCELLED") return "bg-[#f2f4f7] text-[#667085]";
  if (status === "OVERDUE") return "bg-[#fff1f3] text-[#e11d48]";
  return "bg-[#eff6ff] text-[#175cd3]";
}

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
  onEdit: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function FollowUpDetails({
  followUp,
  onEdit,
  onComplete,
  onCancel,
}: FollowUpDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_4px_20px_rgba(20,40,60,0.04)] sm:p-7">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-16 rounded-2xl bg-blue-50 text-xl font-semibold text-blue-700">
            <AvatarFallback className="bg-transparent text-inherit">
              {initials(followUp.businessName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-xl font-bold tracking-tight text-[#334155] sm:text-2xl">
                {followUp.businessName}
              </h1>
              <Badge
                variant="outline"
                className={`rounded-md border-0 px-2.5 py-1 text-xs font-semibold ${statusClass(followUp.status)}`}
              >
                {followUp.status}
              </Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-[#64748b]">
              <MapPin className="size-4 text-[#94a3b8]" />
              {followUp.businessCity || "Business location not available"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {followUp.status !== "COMPLETED" && onComplete && (
            <Button
              type="button"
              onClick={onComplete}
              className="gap-2 bg-[#027a48] text-white hover:bg-[#05603a]"
            >
              <CheckCircle2 className="size-4" /> Mark as Completed
            </Button>
          )}
          <Button type="button" onClick={onEdit} className="gap-2">
            <Pencil className="size-4" /> Reschedule / Edit
          </Button>
          {followUp.status !== "CANCELLED" && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="size-4" /> Cancel follow-up
            </Button>
          )}
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
            <div className="flex gap-3">
              <Phone className="mt-0.5 size-5 text-[#94a3b8]" />
              <div>
                <p className="text-sm text-[#64748b]">Business phone</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  {followUp.businessPhone || "-"}
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

          <div className="mt-8 border-t border-[#eef2f6] pt-6">
            <h3 className="text-sm font-bold text-[#0f172a]">Notes</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#475569]">
              {followUp.notes || "No notes have been added to this follow-up."}
            </p>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
            Business contact
          </p>
          <p className="mt-4 font-semibold text-[#0f172a]">
            {followUp.businessName}
          </p>
          <p className="mt-1 text-sm text-[#64748b]">
            {followUp.businessCity || "-"}
          </p>
          {followUp.businessPhone && (
            <a
              href={`tel:${followUp.businessPhone}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#027a48] hover:underline"
            >
              <Phone className="size-4" /> {followUp.businessPhone}
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
