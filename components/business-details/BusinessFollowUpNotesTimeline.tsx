"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Loader2, MessageSquareText, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useBusinessFollowUpNotesPageQuery, useCreateFollowUpNote } from "@/hooks/use-follow-up-notes";
import { getApiErrorMessage } from "@/lib/api/api-error";

function formatTimestamp(value: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

type ActiveFollowUp = { id: string; scheduledAt: string; status: string; readOnly?: boolean };

export default function BusinessFollowUpNotesTimeline({ businessId, showHeader = true, activeFollowUp }: { businessId: string; showHeader?: boolean; activeFollowUp?: ActiveFollowUp }) {
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const createNote = useCreateFollowUpNote();
  const { data, isLoading, isError, error, refetch, isFetching } = useBusinessFollowUpNotesPageQuery(businessId, page);
  const notes = data?.items ?? [];
  const canGoOlder = data?.totalPages ? page < data.totalPages : notes.length >= (data?.limit ?? 10);
  const noteGroups = notes.reduce<Array<{ dateKey: string; date: string; notes: typeof notes }>>((groups, note) => {
    const date = new Date(note.createdAt);
    const dateKey = Number.isNaN(date.getTime()) ? "unknown-date" : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const existingGroup = groups[groups.length - 1];
    if (existingGroup?.dateKey === dateKey) {
      existingGroup.notes.push(note);
    } else {
      groups.push({ dateKey, date: note.createdAt, notes: [note] });
    }
    return groups;
  }, []);

  const addNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!activeFollowUp || activeFollowUp.readOnly || !trimmedContent || createNote.isPending) return;

    try {
      await createNote.mutateAsync({
        followUpId: activeFollowUp.id,
        content: trimmedContent,
        businessContext: {
          businessId,
          scheduledAt: activeFollowUp.scheduledAt,
          status: activeFollowUp.status,
        },
      });
      setContent("");
      toast.success("Note added to follow-up.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <section aria-labelledby={showHeader ? "conversation-history-heading" : undefined} className={showHeader ? "overflow-hidden border border-[#e4ecf2] bg-white shadow-[0_4px_20px_rgba(20,40,60,0.03)]" : "bg-white"}>
      {showHeader && <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 id="conversation-history-heading" className="text-base font-bold text-slate-900">Conversation History</h2>
          <p className="mt-1 text-xs text-slate-500">Notes recorded across this business&apos;s follow-ups, newest first.</p>
        </div>
        <button type="button" onClick={() => void refetch()} disabled={isFetching} aria-label="Refresh conversation history" title="Refresh" className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50">
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </header>}

      {activeFollowUp && !activeFollowUp.readOnly && <form onSubmit={(event) => void addNote(event)} className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <Textarea
          id={`business-follow-up-note-${activeFollowUp.id}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your notes here"
          className="min-h-20 resize-y rounded-xl border-slate-200 bg-white text-sm"
          disabled={createNote.isPending}
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" disabled={!content.trim() || createNote.isPending} className="gap-2">
            {createNote.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Add note
          </Button>
        </div>
      </form>}

      {isLoading ? (
        <div className="space-y-4 p-5 sm:p-6" aria-label="Loading conversation history">
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="flex gap-3"><div className="h-10 w-12 animate-pulse rounded bg-slate-100" /><div className="h-20 flex-1 animate-pulse rounded-xl bg-slate-100" /></div>)}
        </div>
      ) : isError ? (
        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">Conversation history could not be loaded.</p>
          <p className="mt-1 text-xs text-slate-500">{getApiErrorMessage(error)}</p>
          <button type="button" onClick={() => void refetch()} className="mt-3 text-xs font-semibold text-primary hover:underline">Try again</button>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary"><MessageSquareText className="size-5" /></span>
          <p className="mt-3 text-sm font-semibold text-slate-700">No follow-up notes yet</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Notes added to this business&apos;s follow-ups will appear here.</p>
        </div>
      ) : (
        <ol aria-label="Business follow-up notes timeline" className="px-4 py-5 sm:px-6 sm:py-6">
          {noteGroups.map((group, index) => (
            <li key={group.dateKey} className="grid grid-cols-[3.25rem_1rem_minmax(0,1fr)] gap-2.5 sm:grid-cols-[4rem_1.25rem_minmax(0,1fr)] sm:gap-3.5">
              <time dateTime={group.date} className="pt-1 text-right leading-tight text-slate-400">
                <span className="block text-base font-semibold text-slate-500">{formatTimestamp(group.date, { day: "numeric" })}</span>
                <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-400">{formatTimestamp(group.date, { month: "short", year: "numeric" })}</span>
              </time>
              <div className="relative flex justify-center" aria-hidden="true">
                {index < noteGroups.length - 1 && <span className="absolute bottom-0 top-0 w-px bg-slate-200" />}
                <span className="relative mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-white bg-brand-blue ring-1 ring-brand-blue/30" />
              </div>
              <div className="min-w-0 space-y-3 pb-5">
                {group.notes.map((note) => (
                  <article key={note.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 sm:p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="min-w-0 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-900">{note.content}</p>
                      <div className="ml-auto flex shrink-0 items-center gap-2">
                        <time dateTime={note.createdAt} className="text-xs font-normal text-slate-400">{formatTimestamp(note.createdAt, { hour: "numeric", minute: "2-digit" })}</time>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-slate-100 pt-2.5">
                      <p className="text-xs font-medium text-slate-500">{note.createdByName}</p>
                      {note.scheduledAt ? (
                        activeFollowUp?.id === note.followUpId ? (
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-normal text-slate-500">
                            <CalendarClock className="size-3.5 shrink-0" />
                            <span>Current follow-up</span>
                            {note.status && <StatusBadge status={note.status} />}
                          </span>
                        ) : (
                          <Link href={`/follow-ups/${encodeURIComponent(note.followUpId)}`} className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-brand-blue hover:underline" title="Open linked follow-up">
                            <CalendarClock className="size-3.5 shrink-0" />
                            <span>Follow-up · {formatTimestamp(note.scheduledAt, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                            {note.status && <StatusBadge status={note.status} />}
                          </Link>
                        )
                      ) : <span className="text-xs text-slate-400">Follow-up date unavailable</span>}
                    </div>
                  </article>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
      {!isLoading && !isError && (notes.length > 0 || page > 1) && <nav aria-label="Notes pagination" className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 sm:px-6">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          <ChevronLeft className="size-4" /> New
        </Button>
        <span className="text-xs text-slate-400">Page {data?.page ?? page}</span>
        <Button type="button" variant="outline" size="sm" disabled={!canGoOlder || isFetching} onClick={() => setPage((current) => current + 1)}>
          Older <ChevronRight className="size-4" />
        </Button>
      </nav>}
    </section>
  );
}
