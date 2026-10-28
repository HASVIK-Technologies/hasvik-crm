"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useState } from "react";
import FilterSelect from "@/components/common/FilterSelect";
import PageContainer from "@/components/layout/PageContainer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuditLogsPageQuery } from "@/hooks/use-audit-logs";
import { formatDateTime } from "@/lib/analytics/format";
import type { AuditLogItem } from "@/types/audit-log";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const ACTIONS = ["CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "ASSIGN", "NOTE", "STATUS_CHANGE"];
const ENTITIES = ["BUSINESS", "FOLLOWUP", "CATEGORY", "USER", "SUBSCRIPTION", "TENANT"];

const label = (value: string) => value.toLowerCase().replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
const TONE: Record<string, string> = {
  CREATE: "bg-ok-soft text-ok", DELETE: "bg-bad-soft text-bad", REJECT: "bg-bad-soft text-bad", APPROVE: "bg-ok-soft text-ok",
  UPDATE: "bg-brand-soft text-brand-strong", ASSIGN: "bg-brand-soft text-brand-strong", STATUS_CHANGE: "bg-warn-soft text-warn", NOTE: "bg-surface-2 text-ink-soft",
};

function recordHref(log: AuditLogItem): string | undefined {
  if (!log.entityId) return undefined;
  if (log.entityType === "BUSINESS") return `/businesses/${log.entityId}`;
  if (log.entityType === "FOLLOWUP") return `/follow-ups/${log.entityId}`;
  return undefined;
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const query = useAuditLogsPageQuery({ page, limit: PAGE_SIZE, action: action || undefined, entityType: entityType || undefined });
  const logs = query.data?.logs ?? [];
  const total = query.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer className="space-y-5">
      <div className="fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">Audit logs</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">A record of who changed what, newest first. Open an entry to see the record it affected.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <FilterSelect label="Action" value={action} onChange={(v) => { setAction(v); setPage(1); }} options={[{ value: "", label: "All actions" }, ...ACTIONS.map((a) => ({ value: a, label: label(a) }))]} />
        <FilterSelect label="Record type" value={entityType} onChange={(v) => { setEntityType(v); setPage(1); }} options={[{ value: "", label: "All records" }, ...ENTITIES.map((e) => ({ value: e, label: label(e) }))]} />
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        {query.isPending ? (
          <div role="status" aria-label="Loading audit logs" className="space-y-3 p-4">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14" />)}</div>
        ) : query.isError ? (
          <div role="alert" className="flex flex-wrap items-center gap-3 p-5 text-sm text-warn">
            <span className="flex-1">We couldn&apos;t load the audit logs. You may not have access to them, or the connection dropped.</span>
            <Button variant="outline" onClick={() => void query.refetch()}>Try again</Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-strong"><History className="size-7" aria-hidden /></span>
            <p className="text-base font-semibold text-ink">No activity matches these filters</p>
            <p className="mt-1 max-w-sm text-sm text-muted">Every create, update, assignment and status change is recorded here as it happens.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {logs.map((log) => {
              const href = recordHref(log);
              const name = log.userName || log.userEmail || "Someone";
              const body = (
                <>
                  <Avatar className="size-10 shrink-0 bg-btn"><AvatarFallback className="bg-btn text-xs font-bold text-white">{name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{log.message || `${label(log.action)} ${log.entityType ? label(log.entityType).toLowerCase() : "record"}`}</span>
                    <span className="mt-0.5 block text-xs text-muted">{name} · {formatDateTime(log.createdAt)}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE[log.action] ?? "bg-surface-2 text-ink-soft")}>{label(log.action)}</span>
                    {log.entityType && <span className="text-xs text-muted">{label(log.entityType)}</span>}
                  </span>
                </>
              );
              return (
                <li key={log.id}>
                  {href
                    ? <Link href={href} className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2">{body}</Link>
                    : <div className="flex min-h-16 items-center gap-3 px-4 py-3">{body}</div>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {total > PAGE_SIZE && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted tabular">Page {page} of {pages} · {total} entries</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page"><ChevronLeft className="size-4" aria-hidden />Previous</Button>
            <Button variant="outline" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} aria-label="Next page">Next<ChevronRight className="size-4" aria-hidden /></Button>
          </div>
        </nav>
      )}
    </PageContainer>
  );
}
