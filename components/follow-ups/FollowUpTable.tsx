"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquareText,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PlainButton from "@/components/common/PlainButton";
import FollowUpCommunicationActions from "@/components/follow-ups/FollowUpCommunicationActions";
import OutlinedButton from "@/components/common/OutlinedButton";
import PrimaryButton from "@/components/common/PrimaryButton";
import RecordLink from "@/components/common/RecordLink";
import type { FollowUpItem } from "@/types/follow-up";
import { FollowUpNotesDialog } from "@/components/follow-ups/FollowUpNotes";
import { formatFollowUpType } from "@/lib/business/form-options";
import { useState } from "react";
import { useFollowUpHighlight } from "@/hooks/use-follow-up-highlight";
import {
  canCancelFollowUp,
  canCompleteFollowUp,
  canCreateNextFollowUp,
  canEditFollowUp,
} from "@/lib/follow-ups/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
function formatTime(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "NB"
  );
}
interface FollowUpTableProps {
  items: FollowUpItem[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  onPage: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onEdit: (item: FollowUpItem) => void;
  onCancel: (item: FollowUpItem) => void;
  onComplete: (item: FollowUpItem) => void;
  onNextFollowUp?: (item: FollowUpItem) => void;
}

export default function FollowUpTable({
  items,
  total,
  page,
  limit,
  loading,
  onPage,
  onItemsPerPageChange,
  onEdit,
  onCancel,
  onComplete,
  onNextFollowUp,
}: FollowUpTableProps) {
  const router = useRouter();
  const [notesFollowUp, setNotesFollowUp] = useState<FollowUpItem | null>(null);
  const { highlightFollowUp, isFollowUpHighlighted } = useFollowUpHighlight();
  const openFollowUp = (followUpId: string) => {
    highlightFollowUp(followUpId, true);
    router.push(`/follow-ups/${followUpId}`);
  };
  const handleRowClick = (
    event: React.MouseEvent<HTMLElement>,
    followUpId: string,
  ) => {
    if (
      event.target instanceof Element &&
      event.target.closest(
        "a, button, [role='button'], [role='menu'], [role='menuitem'], [data-radix-dropdown-menu-content], [data-radix-popper-content-wrapper], input, select, textarea",
      )
    ) {
      return;
    }

    openFollowUp(followUpId);
  };
  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    followUpId: string,
  ) => {
    if (
      event.target === event.currentTarget &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      openFollowUp(followUpId);
    }
  };
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const firstResult = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastResult = Math.min(page * limit, total);
  const firstVisiblePage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <>
    <TooltipProvider>
      <div className="overflow-hidden border border-line bg-surface shadow-card rounded-2xl">
        <div className="flex flex-col gap-3.5 border-b border-surface-2 p-3 sm:flex-row sm:items-center sm:justify-between md:p-4">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            Follow-ups{" "}
            <span className="font-medium text-muted">({total})</span>
          </h2>
        </div>
        <div data-layout-mobile>
          {loading ? (
            <div className="flex flex-col gap-3 p-3 md:gap-4 md:p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`follow-up-mobile-skeleton-${index}`} className="space-y-3 border border-surface-2 bg-surface p-4 shadow-sm rounded-2xl">
                  <div className="flex animate-pulse items-center gap-3"><div className="size-10 rounded-full bg-surface-2" /><div className="flex-1 space-y-1.5"><div className="h-4 w-32 rounded bg-surface-2" /><div className="h-3 w-20 rounded bg-surface-2" /></div></div>
                  <div className="h-3 w-48 animate-pulse rounded bg-surface-2" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-16 text-center text-sm text-muted">No follow-ups match your current search and filter criteria.</div>
          ) : (
            <div className="flex flex-col gap-3 p-3 md:gap-4 md:p-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  data-follow-up-item-id={item.id}
                  tabIndex={0}
                  aria-label={`Open follow-up details for ${item.businessName}`}
                  onClick={(event) => handleRowClick(event, item.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, item.id)}
                  className={`flex cursor-pointer items-start justify-between gap-3 border bg-surface p-3 shadow-card transition-all duration-500 hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 md:p-4 ${isFollowUpHighlighted(item.id) ? "border-brand-strong bg-brand-soft/80 ring-2 ring-brand/20" : "border-surface-2"}`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <Link href={`/follow-ups/${item.id}`} onClick={() => highlightFollowUp(item.id, true)} className="shrink-0">
                      <Avatar className="mt-0.5 hidden size-11 rounded-full bg-btn/10 text-sm font-bold text-brand-strong transition-transform hover:scale-105 sm:flex">
                        <AvatarFallback className="bg-transparent text-inherit">{initials(item.businessName)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="min-w-0">
                      <RecordLink href={`/follow-ups/${item.id}`} onClick={() => highlightFollowUp(item.id, true)} className="block max-w-52 truncate text-sm" title={item.businessName}>
                        {item.businessName}
                      </RecordLink>
                      <p className="mt-0.5 text-xs text-muted">{item.businessCity || "-"}{item.businessPhone ? ` • ${item.businessPhone}` : ""}</p>
                      <p className="mt-2 text-xs font-medium text-ink-soft">{formatDate(item.scheduledAt)} at {formatTime(item.scheduledAt)}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatFollowUpType(item.type)} · {item.assignedToName}
                        {item.reminder ? ` · 🔔 ${item.reminder}` : ""}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex shrink-0 flex-col items-end justify-between self-stretch gap-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusBadge
                      status={item.status}
                      className="rounded-md px-2.5 py-0.5 text-[10px]"
                    />
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <FollowUpCommunicationActions item={item} onAction={() => highlightFollowUp(item.id)} />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={`View or add notes for ${item.businessName}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              highlightFollowUp(item.id);
                              setNotesFollowUp(item);
                            }}
                            className="flex size-8 items-center justify-center border border-transparent text-brand-strong transition-colors hover:bg-brand-soft focus-visible:border-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                          >
                            <MessageSquareText className="size-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>View or add notes</TooltipContent>
                      </Tooltip>
                      <DropdownMenu>
                        <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <PlainButton size="icon" aria-label="More actions" className="size-8 border border-transparent text-muted hover:bg-surface-2 hover:text-ink"><MoreVertical className="size-4" /></PlainButton>
                        </DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                        <DropdownMenuContent align="end" className="w-44 bg-surface" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs"><Link href={`/follow-ups/${item.id}`} onClick={() => highlightFollowUp(item.id, true)}><Eye className="size-3.5" /><span>View Details</span></Link></DropdownMenuItem>
                          {canEditFollowUp(item) && (
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                              onSelect={() => { highlightFollowUp(item.id); onEdit(item); }}
                              className="cursor-pointer text-xs"
                            >
                              <Pencil className="mr-1.5 size-3.5 text-muted" /> Edit
                            </DropdownMenuItem>
                          )}
                        {canCreateNextFollowUp(item) && onNextFollowUp && (
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                              onSelect={() => { highlightFollowUp(item.id); onNextFollowUp(item); }}
                              className="cursor-pointer text-xs font-semibold text-accent-strong focus:bg-surface-2/10 focus:text-accent-strong"
                            >
                              <Plus className="mr-1.5 size-3.5" /> Next Follow-Up
                            </DropdownMenuItem>
                          )}
                          {canCompleteFollowUp(item) && (
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                              onSelect={() => { highlightFollowUp(item.id); onComplete(item); }}
                              className="cursor-pointer text-xs text-accent-strong focus:bg-surface-2/10 focus:text-accent-strong"
                            >
                              <CheckCircle2 className="mr-1.5 size-3.5" /> Mark as Completed
                            </DropdownMenuItem>
                          )}
                          {canCancelFollowUp(item) && (
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                              onSelect={() => { highlightFollowUp(item.id); onCancel(item); }}
                              className="cursor-pointer text-xs text-bad focus:bg-surface-2 focus:text-bad"
                            >
                              <Trash2 className="mr-1.5 size-3.5" /> Cancel Follow-up
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div data-layout-desktop className="overflow-x-auto">
          <Table className="w-full min-w-[920px] text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-2 hover:bg-transparent">
                <TableHead className="py-4 pl-6 pr-4 font-semibold">
                  Business / Contact
                </TableHead>
                <TableHead className="px-4 py-4 font-semibold">
                  Follow-up Date
                </TableHead>
                <TableHead className="px-4 py-4 font-semibold">Time</TableHead>
                <TableHead className="px-4 py-4 font-semibold">Type</TableHead>
                <TableHead className="px-4 py-4 font-semibold">
                  Status
                </TableHead>
                <TableHead className="px-4 py-4 font-semibold">
                  Assigned To
                </TableHead>
                <TableHead className="sticky right-0 bg-surface-2 py-4 pl-4 pr-6 text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-2 text-sm text-ink-soft">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow
                    key={`follow-up-skeleton-${index}`}
                    className="border-b border-surface-2"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex animate-pulse items-center gap-3">
                        <div className="size-10 rounded-full bg-surface-2" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 rounded bg-surface-2" />
                          <div className="h-3 w-20 rounded bg-surface-2" />
                        </div>
                      </div>
                    </TableCell>
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} className="px-4 py-4">
                        <div className="h-3.5 w-20 animate-pulse rounded bg-surface-2" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-16 text-center text-sm text-muted"
                  >
                    No follow-ups match your current search and filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    data-follow-up-item-id={item.id}
                    tabIndex={0}
                    aria-label={`Open follow-up details for ${item.businessName}`}
                    onClick={(event) => handleRowClick(event, item.id)}
                    onKeyDown={(event) => handleRowKeyDown(event, item.id)}
                    className={`group cursor-pointer border-b border-surface-2 transition-colors duration-500 hover:bg-surface-2/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 ${isFollowUpHighlighted(item.id) ? "bg-brand-soft ring-2 ring-inset ring-brand/25" : ""}`}
                  >
                    <TableCell className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/follow-ups/${item.id}`} onClick={() => highlightFollowUp(item.id, true)} className="shrink-0">
                          <Avatar className="size-10 rounded-full bg-btn/10 text-xs font-bold text-brand-strong transition-transform hover:scale-105">
                            <AvatarFallback className="bg-transparent text-inherit">
                              {initials(item.businessName)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0">
                          <RecordLink
                            href={`/follow-ups/${item.id}`}
                            onClick={() => highlightFollowUp(item.id, true)}
                            className="block max-w-48 truncate text-sm"
                            title={item.businessName}
                          >
                            {item.businessName}
                          </RecordLink>
                          <p className="mt-0.5 text-xs text-muted">
                            {item.businessCity || "-"}
                            {item.businessPhone
                              ? ` • ${item.businessPhone}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-xs font-medium text-ink-soft">
                      {formatDate(item.scheduledAt)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-xs text-muted">
                      {formatTime(item.scheduledAt)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-xs font-medium text-ink-soft">
                      {formatFollowUpType(item.type)}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <StatusBadge
                        status={item.status}
                        className="rounded-md px-2.5 py-0.5 text-[10px]"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-xs text-ink-soft">
                      {item.assignedToName}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-surface py-4 pl-4 pr-6 group-hover:bg-surface-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <FollowUpCommunicationActions item={item} onAction={() => highlightFollowUp(item.id)} />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label={`View or add notes for ${item.businessName}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                highlightFollowUp(item.id);
                                setNotesFollowUp(item);
                              }}
                              className="flex size-8 items-center justify-center border border-transparent text-brand-strong transition-colors hover:bg-brand-soft focus-visible:border-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                            >
                              <MessageSquareText className="size-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            View or add notes
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                          <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <PlainButton
                              size="icon"
                              aria-label="More actions"
                              className="size-8 border border-transparent text-muted hover:bg-surface-2 hover:text-ink"
                            >
                              <MoreVertical className="size-4" />
                            </PlainButton>
                          </DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-xl border border-line bg-surface p-1 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem asChild className="cursor-pointer text-xs">
                              <Link
                                href={`/follow-ups/${item.id}`}
                                onClick={() => highlightFollowUp(item.id, true)}
                                className="flex w-full items-center gap-2 px-2.5 py-1.5 font-medium text-brand-strong hover:bg-surface-2"
                              >
                                <Eye className="size-3.5 text-muted" />
                                <span>View Details</span>
                              </Link>
                            </DropdownMenuItem>

                            {canEditFollowUp(item) && <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                              onSelect={() => { highlightFollowUp(item.id); onEdit(item); }}
                              className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-brand-strong hover:bg-surface-2 focus:bg-surface-2"
                            >
                              <Pencil className="size-3.5 text-muted" />
                              <span>Edit</span>
                            </DropdownMenuItem>}

                            {canCancelFollowUp(item) && <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                              onSelect={() => { highlightFollowUp(item.id); onCancel(item); }}
                              className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-bad hover:bg-surface-2 focus:bg-surface-2 focus:text-bad"
                            >
                              <Trash2 className="size-3.5 text-bad" />
                              <span>Cancel Follow-Up</span>
                            </DropdownMenuItem>}

                            {canCompleteFollowUp(item) && <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                              onSelect={() => { highlightFollowUp(item.id); onComplete(item); }}
                              className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-accent-strong hover:bg-surface-2/10 focus:bg-surface-2/10 focus:text-accent-strong"
                            >
                              <CheckCircle2 className="size-3.5 text-accent-strong" />
                              <span>Mark as Completed</span>
                            </DropdownMenuItem>}
                            {canCreateNextFollowUp(item) && onNextFollowUp && (
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                onSelect={() => { highlightFollowUp(item.id); onNextFollowUp(item); }}
                                className="cursor-pointer text-xs font-semibold text-accent-strong"
                              >
                                <Plus className="mr-1.5 size-3.5" /> Next Follow-Up
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 border-t border-surface-2 p-3 md:gap-4 md:p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm font-medium text-muted sm:text-left">
            Showing <span className="font-semibold text-ink">{firstResult}</span> to{" "}
            <span className="font-semibold text-ink">{lastResult}</span> of{" "}
            <span className="font-semibold text-ink">{total}</span> results
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end sm:gap-4">
            <div className="flex items-center gap-1.5">
              <OutlinedButton size="icon-sm" type="button" disabled={page === 1} onClick={() => onPage(Math.max(1, page - 1))} className="size-8.5 rounded-lg border border-line text-muted transition-colors disabled:opacity-50">
                <ChevronLeft className="size-4" />
              </OutlinedButton>
              {visiblePages.map((pageNum) => page === pageNum ? (
                <PrimaryButton key={pageNum} size="icon-sm" type="button" onClick={() => onPage(pageNum)} className="size-8.5 rounded-lg p-0 text-sm font-semibold shadow-sm">{pageNum}</PrimaryButton>
              ) : (
                <OutlinedButton key={pageNum} size="icon-sm" type="button" onClick={() => onPage(pageNum)} className="hidden size-8.5 rounded-lg border border-line bg-surface text-muted hover:bg-surface-2 sm:inline-flex">{pageNum}</OutlinedButton>
              ))}
              <OutlinedButton size="icon-sm" type="button" disabled={page >= totalPages} onClick={() => onPage(Math.min(totalPages, page + 1))} className="size-8.5 rounded-lg border border-line text-muted hover:bg-surface-2"><ChevronRight className="size-4" /></OutlinedButton>
            </div>
            <Select value={`${limit} per page`} onValueChange={(value) => onItemsPerPageChange(Number.parseInt(value, 10))}>
              <SelectTrigger className="h-8.5 w-auto rounded-lg border border-line bg-surface pl-3.5 pr-2.5 text-xs font-medium text-ink-soft hover:border-line focus-visible:ring-1 focus-visible:ring-brand"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-surface"><SelectItem value="10 per page" className="text-xs">10 per page</SelectItem><SelectItem value="20 per page" className="text-xs">20 per page</SelectItem><SelectItem value="50 per page" className="text-xs">50 per page</SelectItem><SelectItem value="100 per page" className="text-xs">100 per page</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </TooltipProvider>
    <FollowUpNotesDialog
      followUpId={notesFollowUp?.id}
      followUpName={
        notesFollowUp
          ? `${notesFollowUp.businessName} · ${formatDate(notesFollowUp.scheduledAt)}`
          : ""
      }
      open={Boolean(notesFollowUp)}
      onOpenChange={(open) => {
        if (!open) setNotesFollowUp(null);
      }}
    />
    </>
  );
}
