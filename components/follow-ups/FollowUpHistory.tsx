"use client";

import { useState } from "react";
import { useFollowUpsByBusinessQuery } from "@/hooks/use-follow-ups";
import { useFollowUpNotesQuery } from "@/hooks/use-follow-up-notes";
import { getPreviousFollowUps } from "@/lib/follow-ups/history";
import RecordLink from "@/components/common/RecordLink";
import { StatusBadge } from "@/components/common/StatusBadge";
import FollowUpTypeLabel from "@/components/common/FollowUpTypeLabel";
import { Button } from "@/components/ui/button";
import type { FollowUpItem } from "@/types/follow-up";

function dateTime(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function HistoryEntry({ item }: { item: FollowUpItem }) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const notes = useFollowUpNotesQuery(item.id, page);
  return (
    <li className="min-w-0 space-y-2 px-3 py-3 sm:px-5 sm:py-4">
      <div id={`history-notes-${item.id}`} aria-label="Conversation" className="min-w-0 space-y-3 rounded-lg bg-surface-2/60 p-3">
        {notes.isPending ? <p role="status" className="text-xs text-muted">Loading notes...</p>
          : notes.isError ? <div role="alert" className="text-sm text-bad">Unable to load notes. <Button variant="outline" size="sm" onClick={() => void notes.refetch()}>Try again</Button></div>
          : <>
            {notes.data.items.length === 0 && !item.notes && <p className="text-sm text-muted">No conversation recorded.</p>}
            {(expanded ? notes.data.items : notes.data.items.slice(0, 1)).map((note) => <article key={note.id} className="min-w-0">
              <p className={`${expanded ? "" : "line-clamp-3 "}whitespace-pre-wrap break-words text-sm leading-6 text-ink [overflow-wrap:anywhere]`}>{note.content}</p>
              <p className="mt-1 break-words text-xs leading-5 text-muted [overflow-wrap:anywhere]">{note.createdByName || "Unknown user"} · {dateTime(note.createdAt)}{Date.parse(note.updatedAt) > Date.parse(note.createdAt) && ` · Edited ${dateTime(note.updatedAt)}`}</p>
            </article>)}
            {expanded && (page > 1 || (notes.data.totalPages ?? 1) > 1) && <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1 || notes.isFetching} onClick={() => setPage(page - 1)}>Newer notes</Button>
              <span className="text-xs text-muted">Page {page}</span>
              <Button variant="outline" size="sm" disabled={page >= (notes.data.totalPages ?? 1) || notes.isFetching} onClick={() => setPage(page + 1)}>Older notes</Button>
            </div>}
          </>}
        {item.notes && (expanded || !notes.data?.items.length) && <article className="min-w-0">
          {expanded && Boolean(notes.data?.items.length) && <p className="mb-1 text-xs text-muted">Initial conversation</p>}
          <p className={`${expanded ? "" : "line-clamp-3 "}whitespace-pre-wrap break-words text-sm leading-6 text-ink [overflow-wrap:anywhere]`}>{item.notes}</p>
          <p className="mt-1 break-words text-xs leading-5 text-muted [overflow-wrap:anywhere]">{item.createdByName || "Unknown user"} · {dateTime(item.createdAt)}</p>
        </article>}
      </div>
      {(item.notes || Boolean(notes.data?.items.length)) && <Button
        variant="ghost"
        size="sm"
        className="min-h-9 max-w-full px-2 text-xs text-brand-strong"
        aria-expanded={expanded}
        aria-controls={`history-notes-${item.id}`}
        onClick={() => { setExpanded(!expanded); setPage(1); }}
      >{expanded ? "Show less" : "Read full conversation"}</Button>}
      <footer className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-line/60 pt-2 text-xs leading-5 text-muted [&>span]:min-w-0 [&>span]:[overflow-wrap:anywhere]">
        <RecordLink className="min-w-0 py-1 text-xs [overflow-wrap:anywhere]" href={`/follow-ups/${encodeURIComponent(item.id)}`} aria-label={`View follow-up scheduled for ${dateTime(item.scheduledAt)}`}>
          <time dateTime={item.scheduledAt}>{dateTime(item.scheduledAt)}</time>
        </RecordLink>
        <StatusBadge status={item.status} className="px-2 py-0.5 text-[10px] shadow-none" />
        <span><FollowUpTypeLabel type={item.type} /> · Owner: {item.assignedToName || "Unassigned"}</span>
        <span>Follow-up added by {item.createdByName || "Unknown user"} · {dateTime(item.createdAt)}</span>
      </footer>
    </li>
  );
}

export default function FollowUpHistory({ followUp }: { followUp: FollowUpItem }) {
  const query = useFollowUpsByBusinessQuery(followUp.businessId);
  const [visible, setVisible] = useState(5);
  const items = getPreviousFollowUps(query.data ?? [], followUp);
  return (
    <section aria-labelledby="follow-up-history-heading" className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <header className="border-b border-line px-3 py-3 sm:px-5 sm:py-4">
        <h2 id="follow-up-history-heading" className="text-base font-bold text-ink">Follow-up history</h2>
        <p className="mt-1 text-xs text-muted">Conversations from earlier follow-ups, most recent first.</p>
      </header>
      {!followUp.businessId ? <p className="p-6 text-sm text-muted">Business information unavailable.</p>
        : query.isPending ? <p role="status" className="p-6 text-sm text-muted">Loading follow-up history...</p>
        : query.isError ? <div role="alert" className="space-y-3 p-6"><p className="text-sm text-bad">Unable to load follow-up history.</p><Button variant="outline" size="sm" onClick={() => void query.refetch()}>Try again</Button></div>
        : items.length === 0 ? <p className="p-6 text-sm text-muted">No previous follow-ups.</p>
        : <>
          <ul className="divide-y divide-line">{items.slice(0, visible).map((item) => <HistoryEntry key={item.id} item={item} />)}</ul>
          {visible < items.length && <div className="border-t border-line p-4"><Button variant="outline" onClick={() => setVisible(visible + 5)}>Show older follow-ups</Button></div>}
        </>}
    </section>
  );
}
