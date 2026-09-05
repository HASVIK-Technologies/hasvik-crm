"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  SlidersHorizontal,
  ChevronDown,
  Phone,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
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
import { BusinessItem } from "./types";
import { deleteBusiness } from "@/lib/business-store";
import { DeleteBusinessModal } from "./DeleteBusinessModal";

interface BusinessTableProps {
  businesses: BusinessItem[];
  totalCount?: number;
  onExport?: () => void;
  sortOrder?: string;
  onSortOrderChange?: (sort: string) => void;
  onDelete?: (id: number) => void;
}

export default function BusinessTable({
  businesses,
  totalCount,
  onExport,
  sortOrder = "Latest First",
  onSortOrderChange,
  onDelete,
}: BusinessTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("10 per page");
  const [businessToDelete, setBusinessToDelete] = useState<BusinessItem | null>(null);

  const handleConfirmDelete = () => {
    if (businessToDelete) {
      deleteBusiness(businessToDelete.id);
      onDelete?.(businessToDelete.id);
      setBusinessToDelete(null);
    }
  };

  const displayCount = totalCount !== undefined ? totalCount : businesses.length;

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-2xl border border-[#e4ecf2] bg-white shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
        {/* Top Bar */}
        <div className="flex flex-col gap-3.5 border-b border-[#f1f5f9] p-3 md:p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[#0f172a]">
            Businesses <span className="font-medium text-[#64748b]">({displayCount})</span>
          </h2>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <OutlinedButton
              type="button"
              onClick={onExport}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc] sm:flex-initial sm:px-4"
            >
              <Download className="size-4 text-[#64748b]" />
              Export
            </OutlinedButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <OutlinedButton
                  type="button"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc] sm:w-auto sm:px-4"
                >
                  <SlidersHorizontal className="size-4 text-[#64748b]" />
                  <span>{sortOrder}</span>
                  <ChevronDown className="size-4 text-[#64748b]" />
                </OutlinedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white">
                <DropdownMenuItem
                  onClick={() => onSortOrderChange && onSortOrderChange("Latest First")}
                  className="cursor-pointer text-xs"
                >
                  Latest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSortOrderChange && onSortOrderChange("Oldest First")}
                  className="cursor-pointer text-xs"
                >
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* MOBILE / TABLET VIEW: Card List (< lg) */}
        {/* v0.2 after fixing gapping for mobile componentsin a Card */}
        <div className="block lg:hidden">
          {businesses.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#64748b]">
              No businesses found matching the current filters.
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-4 p-3 md:p-4">
              {businesses.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/businesses/${item.id}`)}
                  className="flex cursor-pointer items-start justify-between gap-3 md:gap-4 rounded-2xl border border-[#eaf0f6] bg-white p-3 md:p-4 shadow-[0_2px_8px_rgba(20,40,60,0.02)] transition-all hover:border-[#0b63e5]/40 hover:shadow-md"
                >
                  {/* Left Side: Avatar + Business Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar
                      className={cn(
                        "size-11 shrink-0 rounded-full text-sm font-bold",
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
                        {item.category} • {item.city}
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
                              router.push(`/businesses/${item.id}`);
                            }}
                            className="cursor-pointer text-xs"
                          >
                            Edit Business
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setBusinessToDelete(item);
                            }}
                            className="cursor-pointer text-xs text-destructive focus:text-destructive"
                          >
                            Delete
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

        {/* DESKTOP VIEW: Table (>= lg) */}
        <div className="hidden lg:block overflow-x-auto">
          <Table className="w-full min-w-[900px] text-left">
            <TableHeader className="bg-[#f8fafc] text-[13px] font-semibold text-[#475569]">
              <TableRow className="border-b border-[#f1f5f9] hover:bg-transparent">
                <TableHead className="py-4 pl-6 pr-4 font-semibold text-[#475569]">Business Name</TableHead>
                <TableHead className="px-4 py-4 font-semibold text-[#475569]">Category</TableHead>
                <TableHead className="px-4 py-4 font-semibold text-[#475569]">City</TableHead>
                <TableHead className="px-4 py-4 font-semibold text-[#475569]">Status</TableHead>
                <TableHead className="px-4 py-4 font-semibold text-[#475569]">Last Follow-up</TableHead>
                <TableHead className="px-4 py-4 font-semibold text-[#475569]">Next Follow-up</TableHead>
                <TableHead className="py-4 pl-4 pr-6 text-right font-semibold text-[#475569]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
              {businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-[#64748b]">
                    No businesses found matching the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                businesses.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => router.push(`/businesses/${item.id}`)}
                    className="cursor-pointer border-b border-[#f1f5f9] transition-colors hover:bg-[#f8fafc]/80"
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
                    <TableCell className="px-4 py-4.5 text-sm text-[#475569]">{item.category}</TableCell>

                    {/* City */}
                    <TableCell className="px-4 py-4.5 text-sm text-[#475569]">{item.city}</TableCell>

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
                    <TableCell className="px-4 py-4.5 text-sm text-[#475569]">{item.lastFollowUp}</TableCell>

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
                                router.push(`/businesses/${item.id}`);
                              }}
                              className="cursor-pointer text-xs"
                            >
                              Edit Business
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setBusinessToDelete(item);
                              }}
                              className="cursor-pointer text-xs text-destructive focus:text-destructive"
                            >
                              Delete
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

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 md:gap-4 border-t border-[#f1f5f9] p-3 md:p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm font-medium text-[#64748b] sm:text-left">
            Showing <span className="font-semibold text-[#0f172a]">1</span> to{" "}
            <span className="font-semibold text-[#0f172a]">{Math.min(10, displayCount)}</span> of{" "}
            <span className="font-semibold text-[#0f172a]">{displayCount}</span> results
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end sm:gap-4">
            <div className="flex items-center gap-1.5">
              <OutlinedButton
                size="icon-sm"
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="size-8.5 rounded-lg border border-[#e2e8f0] text-[#64748b] transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
              </OutlinedButton>
              {[1, 2, 3, 4, 5].map((pageNum) =>
                currentPage === pageNum ? (
                  <PrimaryButton
                    key={pageNum}
                    size="icon-sm"
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className="size-8.5 rounded-lg text-sm font-semibold shadow-sm p-0"
                  >
                    {pageNum}
                  </PrimaryButton>
                ) : (
                  <OutlinedButton
                    key={pageNum}
                    size="icon-sm"
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className="size-8.5 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]"
                  >
                    {pageNum}
                  </OutlinedButton>
                )
              )}
              <OutlinedButton
                size="icon-sm"
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
                className="size-8.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
              >
                <ChevronRight className="size-4" />
              </OutlinedButton>
            </div>

            <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
              <SelectTrigger className="h-8.5 w-auto rounded-lg border border-[#e2e8f0] bg-white pl-3.5 pr-2.5 text-xs font-medium text-[#334155] hover:border-[#cbd5e1] focus-visible:ring-1 focus-visible:ring-[#0b63e5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="10 per page" className="text-xs">
                  10 per page
                </SelectItem>
                <SelectItem value="25 per page" className="text-xs">
                  25 per page
                </SelectItem>
                <SelectItem value="50 per page" className="text-xs">
                  50 per page
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DeleteBusinessModal
        isOpen={businessToDelete !== null}
        businessName={businessToDelete?.name}
        onCancel={() => setBusinessToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </TooltipProvider>
  );
}
