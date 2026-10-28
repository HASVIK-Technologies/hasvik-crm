"use client";

import { getSavedFields } from "@/lib/audit-logs/saved-fields";
import { Activity, CheckCircle2, ClipboardList, Edit3, MessageSquareText, Plus, RefreshCw, UserRoundCog } from "lucide-react";
import { useEntityAuditLogsQuery } from "@/hooks/use-audit-logs";
import type { AuditEntityType } from "@/types/audit-log";
import { getActivityMessages } from "@/lib/audit-logs/activity-messages";

const actionDetails: Record<string, { label: string; icon: typeof Activity; tone: string }> = {
  CREATE: { label: "Business created", icon: Plus, tone: "bg-ok-soft text-ok" },
  UPDATE: { label: "Business updated", icon: Edit3, tone: "bg-brand-soft text-brand-strong" },
  DELETE: { label: "Business deleted", icon: Activity, tone: "bg-bad-soft text-bad" },
  APPROVE: { label: "Business approved", icon: CheckCircle2, tone: "bg-ok-soft text-ok" },
  REJECT: { label: "Business rejected", icon: Activity, tone: "bg-bad-soft text-bad" },
  ASSIGN: { label: "Owner assigned", icon: UserRoundCog, tone: "bg-brand-soft text-brand-strong" },
  NOTE: { label: "Note added", icon: MessageSquareText, tone: "bg-warn-soft text-warn" },
  STATUS_CHANGE: { label: "Lead status changed", icon: RefreshCw, tone: "bg-brand-soft text-brand-strong" },
};

function formatTime(value?: string) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const entityLabels: Record<AuditEntityType, string> = {
  BUSINESS: "Business", FOLLOWUP: "Follow-up", CATEGORY: "Category",
  SUBSCRIPTION: "Subscription", USER: "User", TENANT: "Tenant",
};

export default function EntityActivity({ entityType, entityId }: { entityType: AuditEntityType; entityId: string }) {
  const entityLabel = entityLabels[entityType];
  const { data, isLoading, isError, refetch, isFetching } = useEntityAuditLogsQuery(entityType, entityId);
  const logs = [...(data?.logs ?? [])].sort((a, b) =>
    (Date.parse(b.createdAt ?? "") || 0) - (Date.parse(a.createdAt ?? "") || 0));

  return (
    <section className="overflow-hidden border border-line bg-surface shadow-card rounded-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-surface-2 px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-base font-bold text-ink">Activity</h3>
          <p className="mt-1 text-xs text-muted">{entityLabel} history, newest first.</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink disabled:opacity-50"
          aria-label="Refresh activity"
          title="Refresh activity"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-5 p-6">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-surface-2" />)}</div>
      ) : isError ? (
        <div className="p-8 text-center"><p className="text-sm font-semibold text-ink-soft">Activity could not be loaded.</p><button type="button" onClick={() => void refetch()} className="mt-2 text-xs font-semibold text-brand-strong hover:underline">Try again</button></div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center"><span className="flex size-11 items-center justify-center rounded-full bg-btn/10 text-brand-strong"><ClipboardList className="size-5" /></span><p className="mt-3 text-sm font-semibold text-ink-soft">No activity yet</p><p className="mt-1 max-w-sm text-xs leading-5 text-muted">Changes to this {entityLabel.toLowerCase()} will appear here.</p></div>
      ) : (
        <ol aria-label={`${entityLabel} activity timeline`} className="px-5 py-5 sm:px-6">
          {logs.map((log) => {
            const detail = actionDetails[log.action] ?? { label: log.action.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()), icon: Activity, tone: "bg-surface-2 text-ink-soft" };
            const eventLabel = detail.label.replaceAll("Business", entityLabel).replace("Lead status", entityType === "BUSINESS" ? "Lead status" : `${entityLabel} status`);
            const Icon = detail.icon;
            const fields = getSavedFields(log).map((field) => ({
              ...field,
              label: field.field === "status" && entityType !== "BUSINESS" ? "Status" : field.label,
              value: ["scheduledAt", "completedAt", "startDate", "endDate", "expiresAt"].includes(field.field) && !Number.isNaN(Date.parse(field.value)) ? formatTime(field.value) : field.value,
            }));
            const messages = getActivityMessages(log.action, fields, entityLabel);
            return (
              <li key={log.id} className="group relative flex gap-3 pb-6 last:pb-0 sm:gap-4">
                <span aria-hidden="true" className="absolute bottom-0 left-[17px] top-10 w-px bg-line group-last:hidden" />
                <span aria-hidden="true" className={`relative flex size-9 shrink-0 items-center justify-center rounded-full ${detail.tone}`}><Icon className="size-4" /></span>
                <article className="min-w-0 flex-1 rounded-lg border border-line/80 bg-surface p-3 sm:p-4">
                  <header className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-surface-2 pb-2.5">
                    <p className="min-w-0 text-xs font-semibold text-ink-soft [overflow-wrap:anywhere]">{log.userName || log.userEmail || "System"}</p>
                    <time dateTime={log.createdAt} className="text-xs leading-5 text-muted">{formatTime(log.createdAt)}</time>
                  </header>
                  <p className="break-words text-sm font-semibold text-ink [overflow-wrap:anywhere]">{eventLabel}</p>
                  {messages.length > 0 && <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-5 text-ink-soft">{messages.map((message, index) => <li key={index} className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message}</li>)}</ul>}
                </article>
              </li>
            );
          })}
        </ol>
      )}
      {logs.length > 0 && (data?.total ?? 0) > logs.length && <p className="border-t border-surface-2 px-5 py-3 text-xs text-muted sm:px-6">Showing the latest {logs.length} of {data?.total} activities.</p>}
    </section>
  );
}
