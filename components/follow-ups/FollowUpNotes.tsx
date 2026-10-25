"use client";

import { useBusinessQuery } from "@/hooks/use-businesses";
import { useFollowUpQuery } from "@/hooks/use-follow-ups";
import { isRecordInactive } from "@/lib/records/activity";
import { isFollowUpReadOnly } from "@/lib/follow-ups/actions";
import { useState, type FormEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareText,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/api-error";
import SaveButton from "@/components/common/SaveButton";
import {
  useCreateFollowUpNote,
  useFollowUpNotesQuery,
} from "@/hooks/use-follow-up-notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FollowUpNote } from "@/types/follow-up";

const PAGE_SIZE = 10;

function formatNoteDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function NoteEntry({ note }: { note: FollowUpNote }) {
  const edited =
    new Date(note.updatedAt).getTime() > new Date(note.createdAt).getTime();

  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
        {note.content}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
        <span>{formatNoteDate(note.createdAt)}</span>
        {edited && <span aria-label="Edited">· Edited</span>}
        {note.createdByName && <span>· {note.createdByName}</span>}
      </div>
    </article>
  );
}

function FollowUpNotesPanel({ followUpId, readOnly = false }: { followUpId: string; readOnly?: boolean }) {
  const [page, setPage] = useState(1);
  const [content, setContent] = useState("");
  const notesQuery = useFollowUpNotesQuery(followUpId, page);
  const createMutation = useCreateFollowUpNote();
  const notesPage = notesQuery.data;
  const items = notesPage?.items ?? [];
  const canGoBack = page > 1;
  const canGoForward = notesPage?.totalPages
    ? page < notesPage.totalPages
    : items.length >= (notesPage?.limit ?? PAGE_SIZE);

  const addNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (readOnly || !trimmedContent || createMutation.isPending) return;

    try {
      await createMutation.mutateAsync({
        followUpId,
        content: trimmedContent,
      });
      setContent("");
      setPage(1);
      toast.success("Note added to follow-up.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-5 text-primary" />
            <h2 className="text-base font-bold text-slate-900">Notes</h2>
            {notesPage && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {notesPage.total}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Keep a running record of conversations and next steps.
          </p>
        </div>
      </div>

      {!readOnly && <form onSubmit={(event) => void addNote(event)} className="mt-6">
        <label htmlFor={`follow-up-note-${followUpId}`} className="sr-only">
          Add a note to this follow-up
        </label>
        <Textarea
          id={`follow-up-note-${followUpId}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write an update or capture an important detail..."
          className="min-h-24 resize-y rounded-xl border-slate-200 bg-white text-sm"
          disabled={createMutation.isPending}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="size-3.5 text-brand-green-strong" />
            Notes are saved to this follow-up.
          </p>
          <SaveButton
            type="submit"
            disabled={!content.trim() || createMutation.isPending}
            className="gap-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Add note
          </SaveButton>
        </div>
      </form>}

      <div className="mt-6 border-t border-slate-200 pt-5">
        {notesQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Loading notes...
          </div>
        ) : notesQuery.isError ? (
          <div className="py-5 text-center">
            <p className="text-sm text-red-600">
              {getApiErrorMessage(notesQuery.error)}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void notesQuery.refetch()}
              className="mt-3"
            >
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <MessageSquareText className="mx-auto size-6 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-700">No notes yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Add the first note to keep this follow-up&apos;s history in one place.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((note) => (
                <NoteEntry key={note.id} note={note} />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                {notesPage?.total
                  ? `${(page - 1) * (notesPage.limit || PAGE_SIZE) + 1}–${Math.min(
                      page * (notesPage.limit || PAGE_SIZE),
                      notesPage.total,
                    )} of ${notesPage.total} notes`
                  : `Page ${page}`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canGoBack || notesQuery.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  aria-label="Show newer notes"
                >
                  <ChevronLeft className="size-4" />
                  Newer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canGoForward || notesQuery.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                  aria-label="Show older notes"
                >
                  Older
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function FollowUpNotes({ followUpId, readOnly = false }: { followUpId: string; readOnly?: boolean }) {
  return <FollowUpNotesPanel followUpId={followUpId} readOnly={readOnly} />;
}

export function FollowUpNotesDialog({
  followUpId,
  followUpName,
  open,
  onOpenChange,
  readOnly = false,
}: {
  readOnly?: boolean;
  followUpId?: string;
  followUpName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const followUpQuery = useFollowUpQuery(open ? followUpId : undefined);
  const businessQuery = useBusinessQuery(open ? followUpQuery.data?.businessId : undefined);
  const cannotWrite = readOnly || !businessQuery.data || isRecordInactive(businessQuery.data) || Boolean(followUpQuery.data && isFollowUpReadOnly(followUpQuery.data));
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-slate-200 bg-white shadow-2xl outline-none">
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-lg font-bold text-slate-900">
                Follow-up notes
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 truncate text-sm text-slate-500">
                {followUpName}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close follow-up notes"
                title="Close"
                className="flex size-9 shrink-0 items-center justify-center border border-transparent text-slate-500 transition-colors hover:border-slate-200 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <X className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </header>
          <div className="px-4 py-4 sm:px-6">{followUpId && open && <FollowUpNotesPanel key={followUpId} followUpId={followUpId} readOnly={cannotWrite} />}</div>
          <footer className="sticky bottom-0 z-10 flex justify-end border-t border-slate-200 bg-white px-4 py-3 sm:px-6"><DialogPrimitive.Close asChild><Button type="button" variant="outline" className="rounded-none">Close</Button></DialogPrimitive.Close></footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
