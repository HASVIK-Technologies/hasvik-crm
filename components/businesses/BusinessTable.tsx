"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Building2,
  Eye,
  Pencil,
  Power,
  Settings2,
  UserRound,
  UserRoundCog,
} from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import PlainButton from "@/components/common/PlainButton";
import PrimaryButton from "@/components/common/PrimaryButton";
import RecordLink from "@/components/common/RecordLink";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActivityStateText } from "@/components/common/ActivityStateText";
import { PhoneActionMenu, WhatsAppActionMenu } from "@/components/common/ContactActionMenu";
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
  DropdownMenuCheckboxItem,
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
import { getLeadStatusLabel, STATUS_OPTIONS } from "@/lib/business/form-options";
import { ChangeBusinessStatusModal } from "./ChangeBusinessStatusModal";
import { useBusinessHighlight } from "@/hooks/use-business-highlight";
import AssignBusinessDialog from "./AssignBusinessDialog";
import {
  useBusinessListStore,
  type BusinessTableColumn,
} from "@/store/business-list-store";

const TABLE_COLUMN_OPTIONS: Array<{ value: BusinessTableColumn; label: string }> = [
  { value: "category", label: "Category" },
  { value: "city", label: "City" },
  { value: "responsible", label: "Responsible person" },
  { value: "leadStatus", label: "Lead status" },
  { value: "activity", label: "Activity status" },
  { value: "lastFollowUp", label: "Last follow-up" },
  { value: "nextFollowUp", label: "Next follow-up" },
];

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

export function formatLeadStatusWithStatusOptions(status?: string | null): string {
  if (!status || status === "-") return "-";
  const trimmed = status.trim();
  const upper = trimmed.toUpperCase();
  const option = STATUS_OPTIONS.find(
    (opt) => opt.value.toUpperCase() === upper || opt.label.toUpperCase() === upper,
  );
  if (option) return option.label;
  return getLeadStatusLabel(status);
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
  const [assignmentBusiness, setAssignmentBusiness] = useState<BusinessItem | null>(null);
  const updateStatusMutation = useUpdateBusinessStatus();
  const { highlightBusiness, isBusinessHighlighted } = useBusinessHighlight();
  const visibleTableColumns = useBusinessListStore((state) => state.visibleTableColumns);
  const toggleTableColumn = useBusinessListStore((state) => state.toggleTableColumn);
  const columnVisible = (column: BusinessTableColumn) => visibleTableColumns.includes(column);
  const visibleColumnCount = visibleTableColumns.length + 2;
  const rowPadding = "py-4.5";

  const isLatest = sortOrder === "-createdAt" || sortOrder === "Latest First";
  const sortLabel = isLatest ? "Latest First" : "Oldest First";

  const handleRowClick = (
    event: React.MouseEvent<HTMLElement>,
    businessId: string | number,
    isActive: boolean,
  ) => {
    if (!isActive) return;
    if (
      event.target instanceof Element &&
      event.target.closest(
        "a, button, [role='button'], [role='menu'], [role='menuitem'], [data-radix-dropdown-menu-content], [data-radix-popper-content-wrapper], input, select, textarea",
      )
    ) {
      return;
    }

    highlightBusiness(businessId, true);
    router.push(`/businesses/${businessId}`);
  };

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
      <div className="overflow-hidden border border-[#e4ecf2] bg-white shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
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
                <OutlinedButton size="sm" aria-label="Configure table">
                  <Settings2 className="size-4" />
                  <span className="hidden xl:inline">Columns</span>
                </OutlinedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-white">
                {TABLE_COLUMN_OPTIONS.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.value}
                    checked={columnVisible(column.value)}
                    onCheckedChange={() => toggleTableColumn(column.value)}
                    onSelect={(event) => event.preventDefault()}
                    className="text-xs"
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <OutlinedButton>
                  <ArrowDownUp />
                  <span>{sortLabel}</span>
                  <ChevronDown />
                </OutlinedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white">
                <DropdownMenuItem
                  onClick={() => onSortOrderChange && onSortOrderChange("-createdAt")}
                  className={`cursor-pointer text-xs ${isLatest ? "font-semibold text-primary" : ""}`}
                >
                  Latest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSortOrderChange && onSortOrderChange("+createdAt")}
                  className={`cursor-pointer text-xs ${!isLatest ? "font-semibold text-primary" : ""}`}
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
                  className="animate-pulse border border-[#eaf0f6] bg-white p-4 shadow-sm space-y-3"
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
                  data-business-item-id={String(item.id)}
                  onClick={(event) =>
                    handleRowClick(event, item.id, item.status === "Active")
                  }
                  className={`flex items-start justify-between gap-3 border bg-white p-3 shadow-[0_2px_8px_rgba(20,40,60,0.02)] transition-all duration-500 md:gap-4 md:p-4 ${
                    isBusinessHighlighted(item.id)
                      ? "border-brand-blue bg-blue-50/80 ring-2 ring-brand-blue/20"
                      : "border-[#eaf0f6]"
                  } ${
                    item.status === "Active"
                      ? "cursor-pointer hover:border-primary/40 hover:shadow-md"
                      : ""
                  }`}
                >
                  {/* Left Side: Avatar + Business Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar
                      className="hidden size-11 shrink-0 rounded-full bg-primary/10 text-sm font-bold text-primary sm:flex"
                    >
                      <AvatarFallback className="bg-transparent text-inherit font-bold text-sm">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="max-w-48 truncate text-sm font-bold text-slate-900 sm:max-w-64 sm:text-base" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[#64748b]">
                        {formatDisplayString(item.category, "Uncategorized")} • {formatDisplayString(item.city, "-")}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#64748b]">
                        <span>Lead status:</span>
                        {formatLeadStatusWithStatusOptions(item.leadStatus) !== "-" ? (
                          <StatusBadge status={item.leadStatus || formatLeadStatusWithStatusOptions(item.leadStatus)} label={formatLeadStatusWithStatusOptions(item.leadStatus)} className="max-w-44 rounded-md px-2.5 py-0.5 text-[10px]" />
                        ) : (
                          <span className="text-[#94a3b8]">-</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[#64748b]">{item.phone}</p>
                      <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                        <UserRound className="size-3.5 shrink-0" />
                        <span className="truncate">{item.assignedToName || "Not assigned"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Status Badge, Follow-up, Actions */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2.5">
                    {/* Status Badge */}
                    <div>
                      <ActivityStateText active={item.status === "Active"} />
                    </div>

                    {/* Follow-up text */}
                    <div className="flex flex-col items-end gap-0.5 text-[11px] font-medium text-[#64748b]">
                      {item.nextFollowUp && item.nextFollowUp !== "-" && item.nextFollowUpType !== "none" ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">Next:</span>
                          {item.status === "Active" && item.nextFollowUpId ? (
                            <RecordLink href={`/follow-ups/${item.nextFollowUpId}`} onClick={(event) => event.stopPropagation()}>{item.nextFollowUp}</RecordLink>
                          ) : (
                            <span className="font-medium text-slate-700">{item.nextFollowUp}</span>
                          )}
                        </div>
                      ) : null}
                      {item.lastFollowUp && item.lastFollowUp !== "-" ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">Last:</span>
                          {item.status === "Active" && item.lastFollowUpId ? (
                            <RecordLink href={`/follow-ups/${item.lastFollowUpId}`} onClick={(event) => event.stopPropagation()}>{item.lastFollowUp}</RecordLink>
                          ) : (
                            <span className="text-slate-600">{item.lastFollowUp}</span>
                          )}
                        </div>
                      ) : null}
                      {(!item.nextFollowUp || item.nextFollowUp === "-" || item.nextFollowUpType === "none") && (!item.lastFollowUp || item.lastFollowUp === "-") ? (
                        <span className="text-[#94a3b8]">-</span>
                      ) : null}
                    </div>

                    {/* Action Icons (Phone + WhatsApp + More) */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {item.status === "Active" && <>
                      <PhoneActionMenu numbers={item.phoneNumbers} fallback={item.phone} className="size-7" onAction={() => highlightBusiness(item.id)} />

                      <WhatsAppActionMenu numbers={item.whatsappNumbers} fallback={item.alternatePhone || item.phone} className="size-7" onAction={() => highlightBusiness(item.id)} />
                      </>}

                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <PlainButton
                                size="icon"
                                aria-label={`More actions for ${item.name}`}
                                onClick={(e) => e.stopPropagation()}
                                className="size-7 border border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              >
                                <MoreVertical className="size-4" />
                              </PlainButton>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>More actions</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end" className="w-44 bg-white" onClick={(e) => e.stopPropagation()}>
                          {item.status === "Active" && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                onSelect={() => {
                                  highlightBusiness(item.id, true);
                                  router.push(`/businesses/${item.id}`);
                                }}
                                className="cursor-pointer gap-2 text-xs"
                              >
                                <Eye className="size-3.5" /> <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                onSelect={() => {
                                  highlightBusiness(item.id, true);
                                  router.push(`/businesses/form/${item.id}`);
                                }}
                                className="cursor-pointer gap-2 text-xs"
                              >
                                <Pencil className="size-3.5" /> <span>Edit Business</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setAssignmentBusiness(item)}
                                className="cursor-pointer gap-2 text-xs"
                              >
                                <UserRoundCog className="size-3.5" />
                                <span>{item.assignedToId ? "Reassign Owner" : "Assign Owner"}</span>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStatusModal(item);
                            }}
                            onSelect={() => handleOpenStatusModal(item)}
                            className="cursor-pointer gap-2 text-xs"
                          >
                            <Power className="size-3.5" /> <span>{item.status?.toLowerCase() === "active" ? "Deactivate" : "Activate"}</span>
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
          <Table className="w-full min-w-max text-left">
            <TableHeader className="text-[13px] font-semibold">
              <TableRow className="border-b border-[#f1f5f9] hover:bg-transparent">
                <TableHead className="min-w-60 py-4 pl-6 pr-4 font-semibold">Business Name</TableHead>
                {columnVisible("category") && <TableHead className="px-4 py-4 font-semibold">Category</TableHead>}
                {columnVisible("city") && <TableHead className="px-4 py-4 font-semibold">City</TableHead>}
                {columnVisible("responsible") && <TableHead className="min-w-44 px-4 py-4 font-semibold">Responsible Person</TableHead>}
                {columnVisible("leadStatus") && <TableHead className="px-4 py-4 font-semibold">Lead Status</TableHead>}
                {columnVisible("activity") && <TableHead className="px-4 py-4 font-semibold">Status</TableHead>}
                {columnVisible("lastFollowUp") && <TableHead className="px-4 py-4 font-semibold">Last Follow-up</TableHead>}
                {columnVisible("nextFollowUp") && <TableHead className="px-4 py-4 font-semibold">Next Follow-up</TableHead>}
                <TableHead className="sticky right-0 z-20 min-w-32 bg-white py-4 pl-4 pr-6 text-right font-semibold shadow-[-1px_0_0_#e2e8f0]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={`skeleton-row-${idx}`} className="border-b border-[#f1f5f9]">
                    <TableCell className={cn("pl-6 pr-4", rowPadding)}>
                      <div className="flex items-center gap-3.5 animate-pulse">
                        <div className="size-4 rounded bg-[#f1f5f9]" />
                        <div className="size-11 rounded-full bg-[#f1f5f9]" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 w-32 rounded bg-[#f1f5f9]" />
                          <div className="h-3 w-20 rounded bg-[#f1f5f9]" />
                        </div>
                      </div>
                    </TableCell>
                    {columnVisible("category") && <TableCell className={cn("px-4", rowPadding)}>
                      <div className="h-3.5 w-24 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>}
                    {columnVisible("city") && <TableCell className={cn("px-4", rowPadding)}>
                      <div className="h-3.5 w-20 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>}
                    {columnVisible("responsible") && <TableCell className={cn("px-4", rowPadding)}>
                      <div className="h-3.5 w-24 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>}
                    {columnVisible("leadStatus") && <TableCell className={cn("px-4", rowPadding)}>
                      <div className="h-6 w-16 rounded-full bg-[#f1f5f9] animate-pulse" />
                    </TableCell>}
                    {columnVisible("activity") && <TableCell className={cn("px-4", rowPadding)}>
                      <div className="h-3.5 w-24 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>}
                    {columnVisible("lastFollowUp") && <TableCell className={cn("px-4", rowPadding)}>
                      <div className="h-3.5 w-28 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>}
                    {columnVisible("nextFollowUp") && <TableCell className={cn("px-4", rowPadding)}>
                      <div className="h-3.5 w-20 rounded bg-[#f1f5f9] animate-pulse" />
                    </TableCell>}
                    <TableCell className={cn("sticky right-0 z-10 bg-white pl-4 pr-6 text-right", rowPadding)}>
                      <div className="flex justify-end gap-2 animate-pulse">
                        <div className="size-7 rounded bg-[#f1f5f9]" />
                        <div className="size-7 rounded bg-[#f1f5f9]" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnCount} className="py-0">
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
                    data-business-item-id={String(item.id)}
                    onClick={(event) =>
                      handleRowClick(event, item.id, item.status === "Active")
                    }
                    className={`group border-b border-[#f1f5f9] transition-colors duration-500 ${
                      isBusinessHighlighted(item.id)
                        ? "bg-blue-50 ring-2 ring-inset ring-brand-blue/25"
                        : ""
                    } ${
                      item.status === "Active"
                        ? "cursor-pointer hover:bg-[#f8fafc]/80"
                        : ""
                    }`}
                  >
                    {/* Business Name + Avatar + Phone */}
                    <TableCell className={cn("pl-6 pr-4", rowPadding)}>
                      <div className="flex items-center gap-3.5">
                        <Avatar
                          className="size-10.5 shrink-0 rounded-full bg-primary/10 text-xs font-bold text-primary"
                        >
                          <AvatarFallback className="bg-transparent text-inherit font-bold text-xs">
                            {item.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 max-w-44">
                          <p className="truncate text-sm font-bold text-slate-900" title={item.name}>{item.name}</p>
                          <p className="mt-0.5 text-xs text-[#64748b]">{item.phone}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    {columnVisible("category") && <TableCell className={cn("px-4 text-sm", rowPadding)}>
                      {formatDisplayString(item.category, "Uncategorized")}
                    </TableCell>}

                    {/* City */}
                    {columnVisible("city") && <TableCell className={cn("px-4 text-sm", rowPadding)}>
                      {formatDisplayString(item.city, "-")}
                    </TableCell>}

                    {/* Responsible person */}
                    {columnVisible("responsible") && <TableCell className={cn("px-4 text-sm", rowPadding)}>
                      <div className="min-w-0 max-w-40">
                        <span className={cn("block truncate", item.assignedToName ? "font-medium text-slate-700" : "text-slate-400")} title={item.assignedToName || "Not assigned"}>
                          {item.assignedToName || "Not assigned"}
                        </span>
                      </div>
                    </TableCell>}

                    {/* Lead Status */}
                    {columnVisible("leadStatus") && <TableCell className={cn("px-4", rowPadding)}>
                      {formatLeadStatusWithStatusOptions(item.leadStatus) !== "-" ? (
                        <StatusBadge status={item.leadStatus || formatLeadStatusWithStatusOptions(item.leadStatus)} label={formatLeadStatusWithStatusOptions(item.leadStatus)} className="max-w-48 rounded-md px-2.5 py-0.5 text-[10px]" title={formatLeadStatusWithStatusOptions(item.leadStatus)} />
                      ) : (
                        <span className="text-[#94a3b8]">-</span>
                      )}
                    </TableCell>}

                    {/* Status */}
                    {columnVisible("activity") && <TableCell className={cn("px-4", rowPadding)}><ActivityStateText active={item.status === "Active"} /></TableCell>}

                    {/* Last Follow-up */}
                    {columnVisible("lastFollowUp") && <TableCell className={cn("px-4 text-sm", rowPadding)}>
                      {item.lastFollowUp && item.lastFollowUp !== "-" ? (
                        item.status === "Active" && item.lastFollowUpId ? (
                          <RecordLink href={`/follow-ups/${item.lastFollowUpId}`} onClick={(event) => event.stopPropagation()}>{item.lastFollowUp}</RecordLink>
                        ) : (
                          <span className="font-medium text-slate-700">{item.lastFollowUp}</span>
                        )
                      ) : (
                        <span className="text-[#94a3b8]">-</span>
                      )}
                    </TableCell>}

                    {/* Next Follow-up */}
                    {columnVisible("nextFollowUp") && <TableCell className={cn("px-4", rowPadding)}>
                      {item.nextFollowUp && item.nextFollowUp !== "-" && item.nextFollowUpType !== "none" ? (
                        item.status === "Active" && item.nextFollowUpId ? (
                          <RecordLink href={`/follow-ups/${item.nextFollowUpId}`} onClick={(event) => event.stopPropagation()}>{item.nextFollowUp}</RecordLink>
                        ) : (
                          <span className="font-medium text-slate-700">{item.nextFollowUp}</span>
                        )
                      ) : (
                        <span className="text-[#94a3b8]">-</span>
                      )}
                    </TableCell>}

                    {/* Actions (Call, WhatsApp, 3 dots) */}
                    <TableCell
                      className={cn("sticky right-0 z-10 pl-4 pr-6 text-right shadow-[-1px_0_0_#f1f5f9]", rowPadding, isBusinessHighlighted(item.id) ? "bg-blue-50" : "bg-white")}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2.5">
                        {item.status === "Active" && <>
                        {/* Phone Call */}
                        <PhoneActionMenu numbers={item.phoneNumbers} fallback={item.phone} onAction={() => highlightBusiness(item.id)} />

                        {/* WhatsApp / Message */}
                        <WhatsAppActionMenu numbers={item.whatsappNumbers} fallback={item.alternatePhone || item.phone} onAction={() => highlightBusiness(item.id)} />
                        </>}

                        {/* 3 Dots Menu */}
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <PlainButton
                                  size="icon-sm"
                                  aria-label={`More actions for ${item.name}`}
                                  className="size-8 border border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                >
                                  <MoreVertical className="size-4" />
                                </PlainButton>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>More actions</TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end" className="w-44 bg-white" onClick={(e) => e.stopPropagation()}>
                            {item.status === "Active" && (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  onSelect={() => {
                                    highlightBusiness(item.id, true);
                                    router.push(`/businesses/${item.id}`);
                                  }}
                                  className="cursor-pointer gap-2 text-xs"
                                >
                                  <Eye className="size-3.5" /> <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  onSelect={() => {
                                    highlightBusiness(item.id, true);
                                    router.push(`/businesses/form/${item.id}`);
                                  }}
                                  className="cursor-pointer gap-2 text-xs"
                                >
                                  <Pencil className="size-3.5" /> <span>Edit Business</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => setAssignmentBusiness(item)}
                                  className="cursor-pointer gap-2 text-xs"
                                >
                                  <UserRoundCog className="size-3.5" />
                                  <span>{item.assignedToId ? "Reassign Owner" : "Assign Owner"}</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStatusModal(item);
                              }}
                              onSelect={() => handleOpenStatusModal(item)}
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <Power className="size-3.5" /> <span>{item.status?.toLowerCase() === "active" ? "Deactivate" : "Activate"}</span>
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
              <SelectTrigger className="h-8.5 w-auto rounded-lg border border-[#e2e8f0] bg-white pl-3.5 pr-2.5 text-xs font-medium text-[#334155] hover:border-[#cbd5e1] focus-visible:ring-1 focus-visible:ring-primary">
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
      <AssignBusinessDialog
        business={assignmentBusiness}
        open={assignmentBusiness !== null}
        onOpenChange={(open) => {
          if (!open) setAssignmentBusiness(null);
        }}
      />
    </TooltipProvider>
  );
}
