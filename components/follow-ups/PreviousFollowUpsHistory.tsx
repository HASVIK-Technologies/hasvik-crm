"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  History,
  Mail,
  MessageSquare,
  MessageSquareText,
  MessagesSquare,
  Phone,
  RefreshCw,
  Video,
} from "lucide-react";
import { useBusinessFollowUpsQuery } from "@/hooks/use-business-get-follow-ups";
import { toFollowUpItem } from "@/lib/follow-ups/api";
import { selectPreviousFollowUps } from "@/lib/follow-ups/history";
import { formatFollowUpType } from "@/lib/business/form-options";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FollowUpNotesDialog } from "@/components/follow-ups/FollowUpNotes";
import RecordLink from "@/components/common/RecordLink";
import { Button } from "@/components/ui/button";
import type { FollowUpItem } from "@/types/follow-up";

export interface PreviousFollowUpsHistoryProps {
  businessId?: string;
  currentFollowUpId?: string;
  currentScheduledAt?: string;
  business?: any;
  readOnly?: boolean;
}

function getTypeVisual(type?: string | null) {
  const upper = String(type ?? "").toUpperCase();
  switch (upper) {
    case "CALL":
      return {
        icon: Phone,
        tone: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Call",
      };
    case "MEETING":
      return {
        icon: Video,
        tone: "bg-purple-50 text-purple-700 border-purple-200",
        label: "Meeting",
      };
    case "WHATSAPP":
      return {
        icon: MessageSquare,
        tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "WhatsApp",
      };
    case "EMAIL":
      return {
        icon: Mail,
        tone: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Email",
      };
    default:
      return {
        icon: CalendarClock,
        tone: "bg-slate-100 text-slate-700 border-slate-200",
        label: formatFollowUpType(type),
      };
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function PreviousFollowUpsHistory({
  businessId = "",
  currentFollowUpId,
  currentScheduledAt,
  business,
  readOnly = false,
}: PreviousFollowUpsHistoryProps) {
  const { data: followUps = [], isLoading, isError, refetch, isFetching } =
    useBusinessFollowUpsQuery(businessId);
  const [selectedNotesFollowUp, setSelectedNotesFollowUp] =
    useState<FollowUpItem | null>(null);

  const fallbackFollowUps = useMemo(() => {
    if (!business || typeof business !== "object") return [];
    const list: unknown[] = [];
    const add = (v: unknown) => {
      if (!v) return;
      if (Array.isArray(v)) list.push(...v);
      else if (typeof v === "object") list.push(v);
    };
    add(business.nextFollowups);
    add(business.nextFollowUps);
    add(business.nextFollowup);
    add(business.nextFollowUp);
    add(business.lastFollowup);
    add(business.lastFollowUp);
    add(business.lastFollowups);
    add(business.lastFollowUps);
    add(business.followUps);
    add(business.completedFollowUps);

    const seen = new Set<string>();
    const items: FollowUpItem[] = [];
    for (const entry of list) {
      if (!entry || typeof entry !== "object") continue;
      const parsed = toFollowUpItem(entry as Record<string, unknown>);
      const key = parsed.id || `${parsed.scheduledAt}_${parsed.status}`;
      if (!seen.has(key)) {
        seen.add(key);
        items.push(parsed);
      }
    }
    return items;
  }, [business]);

  const allFollowUps = followUps.length > 0 ? followUps : fallbackFollowUps;

  const previousFollowUps = useMemo(() => {
    return selectPreviousFollowUps(allFollowUps, {
      currentFollowUpId,
      currentScheduledAt,
      limit: 10,
    });
  }, [allFollowUps, currentFollowUpId, currentScheduledAt]);

  const otherCount = useMemo(() => {
    return allFollowUps.filter((item) => item.id && item.id !== currentFollowUpId).length;
  }, [allFollowUps, currentFollowUpId]);

  return (
    <>
      <section
        aria-labelledby="previous-follow-ups-heading"
        className="overflow-hidden border border-[#e4ecf2] bg-white shadow-[0_4px_20px_rgba(20,40,60,0.03)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <History className="size-5 text-primary" />
              <h2
                id="previous-follow-ups-heading"
                className="text-base font-bold text-slate-900"
              >
                Previous Follow-up Conversations
              </h2>
              {previousFollowUps.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {previousFollowUps.length}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Review the previous 10 follow-up conversations and touchpoints for this business.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            aria-label="Refresh previous follow-ups"
            title="Refresh previous follow-ups"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-5 sm:p-6">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Unable to load previous follow-up history.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 text-xs font-semibold text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : previousFollowUps.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <MessagesSquare className="size-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No previous follow-up conversations
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              This is the earliest follow-up recorded for this business, or no earlier conversations have taken place yet.
            </p>
          </div>
        ) : (
          <ol
            aria-label="Previous follow-up conversation history timeline"
            className="space-y-4 p-5 sm:p-6"
          >
            {previousFollowUps.map((item, index) => {
              const visual = getTypeVisual(item.type);
              const Icon = visual.icon;
              const hasNotes = Boolean(item.notes && item.notes.trim());

              return (
                <li
                  key={item.id || index}
                  className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-5"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${visual.tone}`}
                        title={visual.label}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {formatFollowUpType(item.type)} follow-up
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        <time
                          dateTime={item.scheduledAt}
                          className="mt-0.5 block text-xs text-slate-500"
                        >
                          {formatDateTime(item.scheduledAt)}
                        </time>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-xs text-slate-500">
                        Assigned to:{" "}
                        <strong className="font-semibold text-slate-700">
                          {item.assignedToName || "Unassigned"}
                        </strong>
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedNotesFollowUp(item)}
                        className="h-7 gap-1.5 px-2.5 text-xs text-slate-600 hover:text-slate-900"
                        aria-label={`View notes for follow-up on ${formatDateTime(item.scheduledAt)}`}
                      >
                        <MessageSquareText className="size-3.5 text-primary" />
                        <span>Notes thread</span>
                      </Button>
                      {item.id && (
                        <RecordLink
                          href={`/follow-ups/${item.id}`}
                          className="text-xs font-semibold"
                        >
                          View follow-up
                        </RecordLink>
                      )}
                    </div>
                  </header>

                  <div className="mt-3">
                    {hasNotes ? (
                      <div className="rounded-lg border border-slate-200/60 bg-slate-50/70 p-3 text-sm">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          <MessageSquareText className="size-3 text-primary/70" />
                          <span>Conversation Summary</span>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800 [overflow-wrap:anywhere]">
                          {item.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs italic text-slate-400">
                        <span>No conversation summary recorded on this follow-up record.</span>
                        <button
                          type="button"
                          onClick={() => setSelectedNotesFollowUp(item)}
                          className="not-italic font-medium text-primary hover:underline"
                        >
                          Check notes thread
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {previousFollowUps.length > 0 && (
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:px-6">
            <span>
              Showing {previousFollowUps.length}{" "}
              {previousFollowUps.length === 1 ? "follow-up" : "follow-ups"}{" "}
              (previous up to 10).
            </span>
            {businessId && otherCount > previousFollowUps.length && (
              <RecordLink
                href={`/businesses/${businessId}`}
                className="font-semibold text-primary hover:underline"
              >
                View all on business profile →
              </RecordLink>
            )}
          </footer>
        )}
      </section>

      {selectedNotesFollowUp && (
        <FollowUpNotesDialog
          followUpId={selectedNotesFollowUp.id}
          followUpName={`${selectedNotesFollowUp.businessName || "Business"} · ${formatDateTime(selectedNotesFollowUp.scheduledAt)}`}
          open={Boolean(selectedNotesFollowUp)}
          onOpenChange={(open) => {
            if (!open) setSelectedNotesFollowUp(null);
          }}
          readOnly={readOnly}
        />
      )}
    </>
  );
}
