"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  Phone,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import OutlinedButton from "@/components/common/OutlinedButton";
import PlainButton from "@/components/common/PlainButton";
import PrimaryButton from "@/components/common/PrimaryButton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BusinessItem } from "@/types/business";
import { useUpdateBusinessStatus } from "@/hooks/use-businesses";
import { ChangeBusinessStatusModal } from "./ChangeBusinessStatusModal";

function formatDisplayString(val: unknown, fallback: string = "-"): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (
    typeof val === "object" &&
    val !== null &&
    "name" in (val as Record<string, unknown>)
  ) {
    return String((val as { name?: unknown }).name || fallback);
  }
  return String(val);
}

interface BusinessTableProps {
  businesses: BusinessItem[];
  totalCount?: number;
  isLoading?: boolean;
  sortOrder?: string;
  onSortOrderChange?: (sort: string) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onClearFilters?: () => void;
}

export default function BusinessTable({
  businesses,
  totalCount,
  isLoading = false,
  sortOrder = "-createdAt",
  onSortOrderChange,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onClearFilters,
}: BusinessTableProps) {
  const router = useRouter();
  const [statusModalBusiness, setStatusModalBusiness] = useState<BusinessItem | null>(null);
  const updateStatusMutation = useUpdateBusinessStatus();

  const isLatest = sortOrder === "-createdAt" || sortOrder === "Latest First";
  const sortLabel = isLatest ? "Latest First" : "Oldest First";

  const handleOpenStatusModal = (item: BusinessItem) => {
    setStatusModalBusiness(item);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusModalBusiness) return;
    const isCurrentlyActive = statusModalBusiness.status?.toLowerCase() === "active";
    const nextStatus: "Active" | "Inactive" = isCurrentlyActive ? "Inactive" : "Active";

    try {
      await updateStatusMutation.mutateAsync({
        id: statusModalBusiness.id,
        status: nextStatus,
      });
      setStatusModalBusiness(null);
    } catch {
      setStatusModalBusiness(null);
    }
  };

  const displayCount = totalCount !== undefined ? totalCount : businesses.length;
  const firstResult = displayCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const lastResult = Math.min(currentPage * itemsPerPage, displayCount);
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-2xl border border-[#e4ecf2] bg-white shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
        {/* Top Bar */}
        <div className="flex flex-col gap-3.5 border-b border-[#f1f5f9] p-3 md:p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a]">
              Businesses <span className="font-medium text-[#64748b]">({displayCount})</span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <OutlinedButton>
                  <SlidersHorizontal />
                  <span>{sortLabel}</span>
                  <ChevronDown />
                </OutlinedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white">
                <DropdownMenuItem
                  onClick={() => onSortOrderChange && onSortOrderChange("-createdAt")}
                  className={`cursor-pointer text-xs ${isLatest ? "font-semibold text-[#0b63e5]" : ""}`}
                >
                  Latest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSortOrderChange && onSortOrderChange("+createdAt")}
                  className={`cursor-pointer text-xs ${!isLatest ? "font-semibold text-[#0b63e5]" : ""}`}
                >
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div data-layout-mobile>
          {isLoading ? (
            <div className="flex flex-col gap-3 p-3 md:gap-4 md:p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skeleton-mobile-${i}`}
                  className="animate-pulse rounded-2xl border border-[#eaf0f6] bg-white p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#f1f5f9]" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-32 rounded bg-[#f1f5f9]" />
                      <div className="h-3 w-20 rounded bg-[#f1f5f9]" />
                    </div>
                  </div>
                  <div className="h-3 w-48 rounded bg-[#f1f5f9]" />
                </div>
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#64748b] mb-3">
                <Building2 className="size-6 text-[#94a3b8]" />
              </div>
              <h3 className="text-base font-semibold text-[#0f172a]">No businesses found</h3>
              <p className="mt-1 text-xs text-[#64748b] max-w-xs">
                No businesses match your current search and filter criteria. Try clearing some filters.
              </p>
              {onClearFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-xs font-semibold text-[#0f172a] shadow-sm hover:bg-[#f8fafc] transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-4 p-3 md:p-4">
              {businesses.map((item) => (
                <div
                  key={item.id}
                  onClick={
                    item.status === "Active"
                      ? () => router.push(`/businesses/${item.id}`)
                      : undefined
                  }
                  className={`flex items-start justify-between gap-3 rounded-2xl border border-[#eaf0f6] bg-white p-3 shadow-[0_2px_8px_rgba(20,40,60,0.02)] transition-all md:gap-4 md:p-4 ${
                    item.status === "Active"
                      ? "cursor-pointer hover:border-[#0b63e5]/40 hover:shadow-md"
                      : ""
                  }`}
                >
                  {/* Left Side: Avatar + Business Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar
                      className={cn(
                        "hidden size-11 shrink-0 rounded-full text-sm font-bold sm:flex",
                        item.avatarBg,
                        item.avatarTextColor
                      )}
                    >
                      <AvatarFallback className="bg-transparent text-inherit font-bold text-sm">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[#0f172a] sm:text-base">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[#64748b]">
                        {formatDisplayString(item.category, "Uncategorized")} • {formatDisplayString(item.city, "-")}
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748b]">
                        Lead status: {formatDisplayString(item.leadStatus, "-")}
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748b]">{item.phone}</p>
                    </div>
                  </div>

                  {/* Right Side: Status Badge, Follow-up, Actions */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2.5">
                    {/* Status Badge */}
                    <div>
                      {item.status === "Active" ? (
                        <Badge
                          variant="outline"
                          className="border-0 rounded-md bg-[#ecfdf3] px-2.5 py-0.5 text-[11px] font-semibold text-[#027a48] hover:bg-[#ecfdf3]"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-0 rounded-md bg-[#f2f4f7] px-2.5 py-0.5 text-[11px] font-semibold text-[#667085] hover:bg-[#f2f4f7]"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>

                    {/* Follow-up text */}
                    <div className="text-[11px] font-medium text-[#64748b]">
                      {item.nextFollowUpType === "today" ? (
                        <span className="font-medium text-[#027a48]">Today</span>
                      ) : item.nextFollowUpType === "tomorrow" ? (
                        <span className="font-medium text-[#175cd3]">Tomorrow</span>
                      ) : item.nextFollowUpType === "date" ? (
                        <span className="font-medium text-[#175cd3]">{item.nextFollowUp}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </div>

                    {/* Action Icons (Phone + WhatsApp + More) */}
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`tel:${item.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Call ${item.name}`}
                            className="flex size-7 items-center justify-center rounded-lg text-[#059669] transition-colors hover:bg-[#ecfdf3]"
                          >
                            <Phone className="size-4" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>Call {item.name}</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`https://wa.me/91${item.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`WhatsApp ${item.name}`}
                            className="flex size-7 items-center justify-center rounded-lg text-[#16a34a] transition-colors hover:bg-[#ecfdf3]"
                          >
                            <WhatsAppIcon className="size-4" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>WhatsApp {item.name}</TooltipContent>
                      </Tooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <PlainButton
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="size-7 text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                          >
                            <MoreVertical className="size-4" />
                          </PlainButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-white">
                          {item.status === "Active" && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/businesses/${item.id}`);
                                }}
                                className="cursor-pointer text-xs"
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/businesses/form/${item.id}`);
                                }}
                                className="cursor-pointer text-xs"
                              >
                                Edit Business
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStatusModal(item);
                            }}
                            className="cursor-pointer text-xs"
                          >
                            {item.status?.toLowerCase() === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div data-layout-desktop>
        <div className="overflow-x-auto">
          <Table className="w-full min-w-225 text-left">
            <TableHeader className="text-[13px] font-semibold">
              <TableRow className="border-b border-[#f1f5f9] hover:bg-transparent">
                <TableHead className="py-4 pl-6 pr-4 font-semibold">Business Name</TableHead>
                <TableHead className="px-4 py-4 font-semibold">Category</TableHead>
                <TableHead className="px-4 py-4 font-semibold">City</TableHead>
                <TableHead className="px-4 py-4 font-semibold">Lead Status</TableHead>
                <TableHead className="px-4 py-4 font-semibold">Status</TableHead>
                <TableHead className="px-4 py-4 font-semibold">Last Follow-up</TableHead>
                <TableHead className="px-4 py-4 font-semibold">Next Follow-up</TableHead>
                <TableHead className="py-4 pl-4 pr-6 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={`skeleton-row-${idx}`} className="border-b border-[#f1f5f9]">
                    <TableCell className="py-4.5 pl-6 pr-4">
                      <div className="flex items-center gap-3.5 animate-pulse">
                        <div className="size-4 rounded bg-[#f1f5f9]" />
                        <div className="size-11 rounded-full bg-[#f1f5f9]" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 w-32 rounded bg-[#f1f5f9]" />
                          <div className="h-3 w-20 rounded bg-[#f1f5f9]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4.5">
                      <div className="h-3.5 w-24 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>
                    <TableCell className="px-4 py-4.5">
                      <div className="h-3.5 w-20 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>
                    <TableCell className="px-4 py-4.5">
                      <div className="h-6 w-16 rounded-full bg-[#f1f5f9] animate-pulse" />
                    </TableCell>
                    <TableCell className="px-4 py-4.5">
                      <div className="h-3.5 w-24 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>
                    <TableCell className="px-4 py-4.5">
                      <div className="h-3.5 w-28 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>
                    <TableCell className="px-4 py-4.5">
                      <div className="h-3.5 w-20 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>
                    <TableCell className="py-4.5 pl-4 pr-6 text-right">
                      <div className="flex justify-end gap-2 animate-pulse">
                        <div className="size-7 rounded bg-[#f1f5f9]" />
                        <div className="size-7 rounded bg-[#f1f5f9]" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-0">
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#64748b] mb-3">
                        <Building2 className="size-7 text-[#94a3b8]" />
                      </div>
                      <h3 className="text-base font-semibold text-[#0f172a]">No businesses found</h3>
                      <p className="mt-1 text-sm text-[#64748b] max-w-sm">
                        No businesses match your current search and filter criteria. Try clearing some filters or searching for something else.
                      </p>
                      {onClearFilters && (
                        <button
                          type="button"
                          onClick={onClearFilters}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-xs font-semibold text-[#0f172a] shadow-sm hover:bg-[#f8fafc] transition-colors"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                businesses.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={
                      item.status === "Active"
                        ? () => router.push(`/businesses/${item.id}`)
                        : undefined
                    }
                    className={`border-b border-[#f1f5f9] transition-colors ${
                      item.status === "Active"
                        ? "cursor-pointer hover:bg-[#f8fafc]/80"
                        : ""
                    }`}
                  >
                    {/* Business Name + Avatar + Phone */}
                    <TableCell className="py-4.5 pl-6 pr-4">
                      <div className="flex items-center gap-3.5">
                        <Avatar
                          className={cn(
                            "size-10.5 shrink-0 rounded-full text-xs font-bold",
                            item.avatarBg,
                            item.avatarTextColor
                          )}
                        >
                          <AvatarFallback className="bg-transparent text-inherit font-bold text-xs">
                            {item.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-[#0f172a]">{item.name}</p>
                          <p className="mt-0.5 text-xs text-[#64748b]">{item.phone}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="px-4 py-4.5 text-sm">
                      {formatDisplayString(item.category, "Uncategorized")}
                    </TableCell>

                    {/* City */}
                    <TableCell className="px-4 py-4.5 text-sm">
                      {formatDisplayString(item.city, "-")}
                    </TableCell>

                    {/* Lead Status */}
                    <TableCell className="px-4 py-4.5 text-sm">
                      {formatDisplayString(item.leadStatus, "-")}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 py-4.5">
                      {item.status === "Active" ? (
                        <Badge
                          variant="outline"
                          className="border-0 rounded-md bg-[#ecfdf3] px-3 py-1 text-xs font-semibold text-[#027a48] hover:bg-[#ecfdf3]"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-0 rounded-md bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#667085] hover:bg-[#f2f4f7]"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    {/* Last Follow-up */}
                    <TableCell className="px-4 py-4.5 text-sm">{item.lastFollowUp}</TableCell>

                    {/* Next Follow-up */}
                    <TableCell className="px-4 py-4.5">
                      {item.nextFollowUpType === "today" ? (
                        <Badge
                          variant="outline"
                          className="border-0 rounded-md bg-[#ecfdf3] px-3 py-1 text-xs font-semibold text-[#027a48] hover:bg-[#ecfdf3]"
                        >
                          Today
                        </Badge>
                      ) : item.nextFollowUpType === "tomorrow" ? (
                        <Badge
                          variant="outline"
                          className="border-0 rounded-md bg-[#eff8ff] px-3 py-1 text-xs font-semibold text-[#175cd3] hover:bg-[#eff8ff]"
                        >
                          Tomorrow
                        </Badge>
                      ) : item.nextFollowUpType === "date" ? (
                        <Badge
                          variant="outline"
                          className="border-0 rounded-md bg-[#eff8ff] px-3 py-1 text-xs font-semibold text-[#175cd3] hover:bg-[#eff8ff]"
                        >
                          {item.nextFollowUp}
                        </Badge>
                      ) : (
                        <span className="text-[#94a3b8]">-</span>
                      )}
                    </TableCell>

                    {/* Actions (Call, WhatsApp, 3 dots) */}
                    <TableCell className="py-4.5 pl-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {/* Phone Call */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={`tel:${item.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Call ${item.name}`}
                              className="flex size-8.5 items-center justify-center rounded-lg text-[#059669] transition-colors hover:bg-[#ecfdf3]"
                            >
                              <Phone className="size-4.5" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>Call {item.name}</TooltipContent>
                        </Tooltip>

                        {/* WhatsApp / Message */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={`https://wa.me/91${item.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`WhatsApp ${item.name}`}
                              className="flex size-8.5 items-center justify-center rounded-lg text-[#16a34a] transition-colors hover:bg-[#ecfdf3]"
                            >
                              <WhatsAppIcon className="size-4.5" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>WhatsApp {item.name}</TooltipContent>
                        </Tooltip>

                        {/* 3 Dots Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <PlainButton
                              size="icon-sm"
                              aria-label={`More actions for ${item.name}`}
                              className="size-8.5 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#334155]"
                            >
                              <MoreVertical className="size-4.5" />
                            </PlainButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 bg-white">
                            {item.status === "Active" && (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/businesses/${item.id}`);
                                  }}
                                  className="cursor-pointer text-xs"
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/businesses/form/${item.id}`);
                                  }}
                                  className="cursor-pointer text-xs"
                                >
                                  Edit Business
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStatusModal(item);
                              }}
                              className="cursor-pointer text-xs"
                            >
                              {item.status?.toLowerCase() === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
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
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 md:gap-4 border-t border-[#f1f5f9] p-3 md:p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm font-medium text-[#64748b] sm:text-left">
            Showing <span className="font-semibold text-[#0f172a]">{firstResult}</span> to{" "}
            <span className="font-semibold text-[#0f172a]">{lastResult}</span> of{" "}
            <span className="font-semibold text-[#0f172a]">{displayCount}</span> results
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end sm:gap-4">
            <div className="flex items-center gap-1.5">
              <OutlinedButton
                size="icon-sm"
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className="size-8.5 rounded-lg border border-[#e2e8f0] text-[#64748b] transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
              </OutlinedButton>
              {visiblePages.map((pageNum) =>
                currentPage === pageNum ? (
                  <PrimaryButton
                    key={pageNum}
                    size="icon-sm"
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className="size-8.5 rounded-lg text-sm font-semibold shadow-sm p-0"
                  >
                    {pageNum}
                  </PrimaryButton>
                ) : (
                  <OutlinedButton
                    key={pageNum}
                    size="icon-sm"
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className="size-8.5 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]"
                  >
                    {pageNum}
                  </OutlinedButton>
                )
              )}
              <OutlinedButton
                size="icon-sm"
                type="button"
                disabled={totalPages === 0 || currentPage >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className="size-8.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
              >
                <ChevronRight className="size-4" />
              </OutlinedButton>
            </div>

            <Select
              value={`${itemsPerPage} per page`}
              onValueChange={(value) => onItemsPerPageChange(Number.parseInt(value, 10))}
            >
              <SelectTrigger className="h-8.5 w-auto rounded-lg border border-[#e2e8f0] bg-white pl-3.5 pr-2.5 text-xs font-medium text-[#334155] hover:border-[#cbd5e1] focus-visible:ring-1 focus-visible:ring-[#0b63e5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="10 per page" className="text-xs">
                  10 per page
                </SelectItem>
                <SelectItem value="20 per page" className="text-xs">
                  20 per page
                </SelectItem>
                <SelectItem value="50 per page" className="text-xs">
                  50 per page
                </SelectItem>
                <SelectItem value="100 per page" className="text-xs">
                  100 per page
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ChangeBusinessStatusModal
        isOpen={statusModalBusiness !== null}
        business={statusModalBusiness}
        targetStatus={
          statusModalBusiness?.status?.toLowerCase() === "active"
            ? "Inactive"
            : "Active"
        }
        isLoading={updateStatusMutation.isPending}
        onCancel={() => {
          if (!updateStatusMutation.isPending) {
            setStatusModalBusiness(null);
          }
        }}
        onConfirm={handleConfirmStatusChange}
      />
    </TooltipProvider>
  );
}
