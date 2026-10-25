"use client";

import { Activity, CheckCircle2, ClipboardList, Edit3, MessageSquareText, Plus, RefreshCw, UserRoundCog } from "lucide-react";
import { useBusinessAuditLogsQuery } from "@/hooks/use-audit-logs";
import type { AuditLogItem } from "@/types/audit-log";

const actionDetails: Record<string, { label: string; icon: typeof Activity; tone: string }> = {
  CREATE: { label: "Business created", icon: Plus, tone: "bg-emerald-50 text-emerald-700" },
  UPDATE: { label: "Business updated", icon: Edit3, tone: "bg-blue-50 text-blue-700" },
  DELETE: { label: "Business deleted", icon: Activity, tone: "bg-rose-50 text-rose-700" },
  APPROVE: { label: "Business approved", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
  REJECT: { label: "Business rejected", icon: Activity, tone: "bg-rose-50 text-rose-700" },
  ASSIGN: { label: "Owner assigned", icon: UserRoundCog, tone: "bg-violet-50 text-violet-700" },
  NOTE: { label: "Note added", icon: MessageSquareText, tone: "bg-amber-50 text-amber-700" },
  STATUS_CHANGE: { label: "Lead status changed", icon: RefreshCw, tone: "bg-cyan-50 text-cyan-700" },
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

const fieldLabels: Record<string, string> = {
  name: "Business name", description: "Description", categoryId: "Category",
  businessType: "Business type", status: "Lead status", phoneNumbers: "Phone numbers",
  whatsappNumbers: "WhatsApp numbers", email: "Email", website: "Website",
  address: "Address", city: "City", state: "State", pincode: "PIN code",
  location: "Location", assignedTo: "Assigned to", leadSource: "Lead source", isActive: "Active",
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(", ") : "Not set";
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    const label = item.fullName ?? item.name ?? item.email ?? item.number ?? item.url;
    if (label !== undefined) return `${formatValue(label)}${item.isPrimary === true ? " (primary)" : ""}`;
    return "Details unavailable";
  }
  return String(value).replace(/^[A-Z][A-Z_]+$/, (text) => text.toLowerCase().replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase()));
}

function getSavedFields(log: AuditLogItem) {
  const changes = log.changes ?? {};
  const fields = Array.isArray(changes.changedFields)
    ? changes.changedFields.filter((field): field is string => typeof field === "string")
    : Object.keys(changes);
  const snapshot = changes.newData && typeof changes.newData === "object"
    ? changes.newData as Record<string, unknown>
    : changes;
  return [...new Set(fields)].filter((field) => field in fieldLabels).map((field) => ({
    field, label: fieldLabels[field],
    value: Object.hasOwn(snapshot, field) ? formatValue(snapshot[field]) : "Value unavailable",
  }));
}

export default function BusinessDetailsActivity({ businessId }: { businessId: string }) {
  const { data, isLoading, isError, refetch, isFetching } = useBusinessAuditLogsQuery(businessId);
  const logs = [...(data?.logs ?? [])].sort((a, b) =>
    (Date.parse(b.createdAt ?? "") || 0) - (Date.parse(a.createdAt ?? "") || 0));

  return (
    <section className="overflow-hidden border border-[#e4ecf2] bg-white shadow-[0_4px_20px_rgba(20,40,60,0.03)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Activity</h3>
          <p className="mt-1 text-xs text-slate-500">Business history, newest first.</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          aria-label="Refresh activity"
          title="Refresh activity"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-5 p-6">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div>
      ) : isError ? (
        <div className="p-8 text-center"><p className="text-sm font-semibold text-slate-700">Activity could not be loaded.</p><button type="button" onClick={() => void refetch()} className="mt-2 text-xs font-semibold text-primary hover:underline">Try again</button></div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center"><span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary"><ClipboardList className="size-5" /></span><p className="mt-3 text-sm font-semibold text-slate-700">No activity yet</p><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Updates, assignments, and status changes for this business will appear here.</p></div>
      ) : (
        <ol aria-label="Business activity timeline" className="px-5 py-5 sm:px-6">
          {logs.map((log) => {
            const detail = actionDetails[log.action] ?? { label: log.action.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()), icon: Activity, tone: "bg-slate-100 text-slate-700" };
            const Icon = detail.icon;
            const fields = getSavedFields(log);
            return (
              <li key={log.id} className="group relative flex gap-3 pb-6 last:pb-0 sm:gap-4">
                <span aria-hidden="true" className="absolute bottom-0 left-[17px] top-10 w-px bg-slate-200 group-last:hidden" />
                <span aria-hidden="true" className={`relative flex size-9 shrink-0 items-center justify-center rounded-full ${detail.tone}`}><Icon className="size-4" /></span>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><p className="text-sm font-semibold text-slate-800">{detail.label}</p><time dateTime={log.createdAt} className="text-xs text-slate-400">{formatTime(log.createdAt)}</time></div>
                  <p className="mt-1 text-xs text-slate-500">{log.userName || log.userEmail || "System"}</p>
                  {fields.length > 0 && (
                    <details className="mt-3 rounded-lg border border-slate-100 bg-slate-50/70">
                      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-slate-600 focus-visible:outline-2 focus-visible:outline-primary">View saved details ({fields.length} fields)</summary>
                      <p className="px-3 pb-2 text-xs text-slate-500">Values recorded with this event.</p>
                      <dl className="grid gap-x-4 gap-y-3 border-t border-slate-100 p-3 sm:grid-cols-2">
                        {fields.map(({ field, label, value }) => (
                          <div key={field} className="min-w-0"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-xs font-medium text-slate-800 [overflow-wrap:anywhere]">{value}</dd></div>
                        ))}
                      </dl>
                    </details>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {logs.length > 0 && (data?.total ?? 0) > logs.length && <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-6">Showing the latest {logs.length} of {data?.total} activities.</p>}
    </section>
  );
}
