"use client";

import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import OutlinedButton from "@/components/common/OutlinedButton";
import PrimaryButton from "@/components/common/PrimaryButton";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import type { FollowUpItem } from "@/types/follow-up";
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
function statusStyle(status: string) {
  if (status === "OVERDUE") return "bg-[#fff1f3] text-[#e11d48]";
  if (status === "COMPLETED") return "bg-[#ecfdf3] text-[#027a48]";
  if (status === "CANCELLED") return "bg-[#f2f4f7] text-[#667085]";
  return "bg-[#eff6ff] text-[#175cd3]";
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
}: FollowUpTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const firstResult = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastResult = Math.min(page * limit, total);
  const firstVisiblePage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-2xl border border-[#e4ecf2] bg-white shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
        <div className="flex flex-col gap-3.5 border-b border-[#f1f5f9] p-3 sm:flex-row sm:items-center sm:justify-between md:p-4">
          <h2 className="text-lg font-bold tracking-tight text-[#0f172a]">
            Follow-ups{" "}
            <span className="font-medium text-[#64748b]">({total})</span>
          </h2>
        </div>
        <div data-layout-mobile>
          {loading ? (
            <div className="flex flex-col gap-3 p-3 md:gap-4 md:p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`follow-up-mobile-skeleton-${index}`} className="space-y-3 rounded-2xl border border-[#eaf0f6] bg-white p-4 shadow-sm">
                  <div className="flex animate-pulse items-center gap-3"><div className="size-10 rounded-full bg-[#f1f5f9]" /><div className="flex-1 space-y-1.5"><div className="h-4 w-32 rounded bg-[#f1f5f9]" /><div className="h-3 w-20 rounded bg-[#f1f5f9]" /></div></div>
                  <div className="h-3 w-48 animate-pulse rounded bg-[#f1f5f9]" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-16 text-center text-sm text-[#64748b]">No follow-ups match your current search and filter criteria.</div>
          ) : (
            <div className="flex flex-col gap-3 p-3 md:gap-4 md:p-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-[#eaf0f6] bg-white p-3 shadow-[0_2px_8px_rgba(20,40,60,0.02)] transition-all hover:border-[#0b63e5]/40 hover:shadow-md md:p-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="mt-0.5 size-11 shrink-0 rounded-full bg-[#e0eafe] text-sm font-bold text-[#2e90fa]"><AvatarFallback className="bg-transparent text-inherit">{initials(item.businessName)}</AvatarFallback></Avatar>
                    <div className="min-w-0"><h3 className="truncate text-sm font-bold text-[#0f172a]">{item.businessName}</h3><p className="mt-0.5 text-xs text-[#64748b]">{item.businessCity || "-"}{item.businessPhone ? ` • ${item.businessPhone}` : ""}</p><p className="mt-2 text-xs font-medium text-[#475569]">{formatDate(item.scheduledAt)} at {formatTime(item.scheduledAt)}</p><p className="mt-1 text-xs text-[#64748b]">{item.type} · {item.assignedToName}</p></div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between self-stretch gap-2.5"><Badge variant="outline" className={`rounded-md border-0 px-2.5 py-0.5 text-[10px] font-semibold ${statusStyle(item.status)}`}>{item.status}</Badge><div className="flex items-center gap-1.5"><a href={item.businessPhone ? `tel:${item.businessPhone}` : undefined} aria-label={`Call ${item.businessName}`} className="flex size-7 items-center justify-center rounded-lg text-[#059669] hover:bg-[#ecfdf3] aria-disabled:pointer-events-none aria-disabled:opacity-40"><Phone className="size-4" /></a><a href={item.businessPhone ? `https://wa.me/91${item.businessPhone}` : undefined} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${item.businessName}`} className="flex size-7 items-center justify-center rounded-lg text-[#16a34a] hover:bg-[#ecfdf3] aria-disabled:pointer-events-none aria-disabled:opacity-40"><WhatsAppIcon className="size-4" /></a><DropdownMenu><DropdownMenuTrigger asChild><PlainButton size="icon" aria-label="More actions" className="size-7 text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#0f172a]"><MoreVertical className="size-4" /></PlainButton></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-36 bg-white"><DropdownMenuItem asChild className="cursor-pointer text-xs"><Link href={`/follow-ups/${item.id}`}>View Details</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => onEdit(item)} className="cursor-pointer text-xs">Reschedule / Edit</DropdownMenuItem><DropdownMenuItem onSelect={() => onCancel(item)} className="cursor-pointer text-xs">Cancel Follow-up</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div data-layout-desktop className="overflow-x-auto">
          <Table className="w-full min-w-[920px] text-left">
            <TableHeader className="text-[11px] font-semibold text-[#64748b]">
              <TableRow className="border-b border-[#f1f5f9] hover:bg-transparent">
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
                <TableHead className="py-4 pl-4 pr-6 text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow
                    key={`follow-up-skeleton-${index}`}
                    className="border-b border-[#f1f5f9]"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex animate-pulse items-center gap-3">
                        <div className="size-10 rounded-full bg-[#f1f5f9]" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 rounded bg-[#f1f5f9]" />
                          <div className="h-3 w-20 rounded bg-[#f1f5f9]" />
                        </div>
                      </div>
                    </TableCell>
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} className="px-4 py-4">
                        <div className="h-3.5 w-20 animate-pulse rounded bg-[#f1f5f9]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-16 text-center text-sm text-[#64748b]"
                  >
                    No follow-ups match your current search and filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-[#f1f5f9] transition-colors hover:bg-[#f8fafc]/80"
                  >
                    <TableCell className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 shrink-0 rounded-full bg-[#e0eafe] text-xs font-bold text-[#2e90fa]">
                          <AvatarFallback className="bg-transparent text-inherit">
                            {initials(item.businessName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#0f172a]">
                            {item.businessName}
                          </p>
                          <p className="mt-0.5 text-xs text-[#64748b]">
                            {item.businessCity || "-"}
                            {item.businessPhone
                              ? ` • ${item.businessPhone}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-xs font-medium text-[#475569]">
                      {formatDate(item.scheduledAt)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-xs text-[#64748b]">
                      {formatTime(item.scheduledAt)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-xs font-medium text-[#475569]">
                      {item.type}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-md border-0 px-2.5 py-0.5 text-[10px] font-semibold hover:opacity-90 ${statusStyle(item.status)}`}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-xs text-[#475569]">
                      {item.assignedToName}
                    </TableCell>
                    <TableCell className="py-4 pl-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={
                                item.businessPhone
                                  ? `tel:${item.businessPhone}`
                                  : undefined
                              }
                              aria-label={`Call ${item.businessName}`}
                              className="flex size-7 items-center justify-center rounded-lg text-[#059669] transition-colors hover:bg-[#ecfdf3] aria-disabled:pointer-events-none aria-disabled:opacity-40"
                            >
                              <Phone className="size-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            Call {item.businessName}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={
                                item.businessPhone
                                  ? `https://wa.me/91${item.businessPhone}`
                                  : undefined
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`WhatsApp ${item.businessName}`}
                              className="flex size-7 items-center justify-center rounded-lg text-[#16a34a] transition-colors hover:bg-[#ecfdf3] aria-disabled:pointer-events-none aria-disabled:opacity-40"
                            >
                              <WhatsAppIcon className="size-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            WhatsApp {item.businessName}
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <PlainButton
                              size="icon"
                              aria-label="More actions"
                              className="size-7 text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                            >
                              <MoreVertical className="size-4" />
                            </PlainButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-36 bg-white"
                          >
                            <DropdownMenuItem asChild className="cursor-pointer text-xs"><Link href={`/follow-ups/${item.id}`}>View Details</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onEdit(item)} className="cursor-pointer text-xs">Reschedule / Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onCancel(item)} className="cursor-pointer text-xs">Cancel Follow-up</DropdownMenuItem>
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
        <div className="flex flex-col gap-3 border-t border-[#f1f5f9] p-3 md:gap-4 md:p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm font-medium text-[#64748b] sm:text-left">
            Showing <span className="font-semibold text-[#0f172a]">{firstResult}</span> to{" "}
            <span className="font-semibold text-[#0f172a]">{lastResult}</span> of{" "}
            <span className="font-semibold text-[#0f172a]">{total}</span> results
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end sm:gap-4">
            <div className="flex items-center gap-1.5">
              <OutlinedButton size="icon-sm" type="button" disabled={page === 1} onClick={() => onPage(Math.max(1, page - 1))} className="size-8.5 rounded-lg border border-[#e2e8f0] text-[#64748b] transition-colors disabled:opacity-50">
                <ChevronLeft className="size-4" />
              </OutlinedButton>
              {visiblePages.map((pageNum) => page === pageNum ? (
                <PrimaryButton key={pageNum} size="icon-sm" type="button" onClick={() => onPage(pageNum)} className="size-8.5 rounded-lg p-0 text-sm font-semibold shadow-sm">{pageNum}</PrimaryButton>
              ) : (
                <OutlinedButton key={pageNum} size="icon-sm" type="button" onClick={() => onPage(pageNum)} className="size-8.5 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]">{pageNum}</OutlinedButton>
              ))}
              <OutlinedButton size="icon-sm" type="button" disabled={page >= totalPages} onClick={() => onPage(Math.min(totalPages, page + 1))} className="size-8.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"><ChevronRight className="size-4" /></OutlinedButton>
            </div>
            <Select value={`${limit} per page`} onValueChange={(value) => onItemsPerPageChange(Number.parseInt(value, 10))}>
              <SelectTrigger className="h-8.5 w-auto rounded-lg border border-[#e2e8f0] bg-white pl-3.5 pr-2.5 text-xs font-medium text-[#334155] hover:border-[#cbd5e1] focus-visible:ring-1 focus-visible:ring-[#0b63e5]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white"><SelectItem value="10 per page" className="text-xs">10 per page</SelectItem><SelectItem value="20 per page" className="text-xs">20 per page</SelectItem><SelectItem value="50 per page" className="text-xs">50 per page</SelectItem><SelectItem value="100 per page" className="text-xs">100 per page</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
