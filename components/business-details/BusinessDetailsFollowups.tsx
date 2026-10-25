"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  MessageSquareText,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/common/StatusBadge";
import CancelFollowUpDialog from "@/components/follow-ups/CancelFollowUpDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBusinessFollowUpsQuery } from "@/hooks/use-business-get-follow-ups";
import {
  useCancelFollowUp,
  useCompleteFollowUp,
} from "@/hooks/use-follow-ups";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  canCancelFollowUp,
  canCompleteFollowUp,
  canCreateNextFollowUp,
  canEditFollowUp,
} from "@/lib/follow-ups/actions";
import { useModalStore } from "@/store/business-modal-store";
import type { FollowUpItem } from "@/types/follow-up";
import { FollowUpNotesDialog } from "@/components/follow-ups/FollowUpNotes";
import { formatFollowUpType } from "@/lib/business/form-options";
import { useState } from "react";

interface BusinessDetailsFollowupsProps {
  businessId?: string;
  readOnly?: boolean;
}

function formatScheduledAt(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function BusinessDetailsFollowups({
  businessId: propBusinessId,
  readOnly = false,
}: BusinessDetailsFollowupsProps = {}) {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const businessId =
    propBusinessId ??
    (Array.isArray(params?.id) ? params.id[0] : params?.id ?? "");
  const { data: followUps = [], isLoading, isError } =
    useBusinessFollowUpsQuery(businessId);
  const { openFollowUpModal } = useModalStore();
  const [cancellingFollowUp, setCancellingFollowUp] =
    useState<FollowUpItem | null>(null);
  const [notesFollowUp, setNotesFollowUp] = useState<FollowUpItem | null>(null);
  const cancelMutation = useCancelFollowUp();
  const completeMutation = useCompleteFollowUp();

  const cancelFollowUp = async () => {
    if (!cancellingFollowUp || !canCancelFollowUp(cancellingFollowUp)) return;
    try {
      await cancelMutation.mutateAsync(cancellingFollowUp.id);
      toast.success("Follow-up cancelled successfully.");
      setCancellingFollowUp(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const completeFollowUp = async (followUp: FollowUpItem) => {
    if (!canCompleteFollowUp(followUp)) return;
    try {
      await completeMutation.mutateAsync(followUp.id);
      toast.success("Follow-up marked as completed.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const openFollowUp = (followUpId: string) => {
    router.push(`/follow-ups/${followUpId}`);
  };
  const handleRowClick = (
    event: React.MouseEvent<HTMLTableRowElement>,
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
    event: React.KeyboardEvent<HTMLTableRowElement>,
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

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading follow-ups...</div>;
  }
  if (isError) {
    return <div className="p-6 text-red-500">Failed to load follow-ups.</div>;
  }

  return (
    <>
      <div className="overflow-hidden border border-[#e4ecf2] bg-white shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-base font-bold text-slate-900">Follow-up history</h3>
          <p className="text-xs text-slate-500">
            Review scheduled touchpoints, notes, and assigned owners.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[760px] text-left">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Date &amp; time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead className="sticky right-0 bg-slate-50 pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-sm text-slate-700">
              {followUps.map((item) => {
                return (
                  <TableRow
                    key={item.id}
                    tabIndex={0}
                    aria-label={`Open follow-up details for ${formatScheduledAt(item.scheduledAt)}`}
                    onClick={(event) => handleRowClick(event, item.id)}
                    onKeyDown={(event) => handleRowKeyDown(event, item.id)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                  >
                    <TableCell className="whitespace-nowrap pl-6 font-medium text-slate-900">
                      {formatScheduledAt(item.scheduledAt)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                        {formatFollowUpType(item.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={item.status}
                        className="rounded-md px-2.5 py-0.5 text-[10px]"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {item.assignedToName || "Unassigned"}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-white pr-6 group-hover:bg-slate-50" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label={`View or add notes for follow-up on ${formatScheduledAt(item.scheduledAt)}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotesFollowUp(item);
                              }}
                              className="inline-flex size-8 items-center justify-center border border-transparent text-brand-blue transition-colors hover:bg-blue-50 focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20"
                            >
                              <MessageSquareText className="size-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>View or add notes</TooltipContent>
                        </Tooltip>
                        {!readOnly && <DropdownMenu>
                          <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              aria-label={`Actions for follow-up on ${formatScheduledAt(item.scheduledAt)}`}
                              className="flex size-8 items-center justify-center border border-transparent text-slate-500 outline-none hover:bg-slate-100 hover:text-slate-800"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer gap-2 p-2 text-xs font-medium text-slate-700"
                            >
                              <Link href={`/follow-ups/${item.id}`} className="flex items-center gap-2">
                                <Eye className="size-3.5" /> <span>View Details</span>
                              </Link>
                            </DropdownMenuItem>
                            {canEditFollowUp(item) && (
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 p-2 text-xs font-medium text-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFollowUpModal(businessId, item);
                                }}
                                onSelect={() => openFollowUpModal(businessId, item)}
                              >
                                <Pencil className="size-3.5" /> <span>Reschedule / Edit</span>
                              </DropdownMenuItem>
                            )}
                            {canCompleteFollowUp(item) && (
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 p-2 text-xs font-medium text-brand-green-strong"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void completeFollowUp(item);
                                }}
                                onSelect={() => void completeFollowUp(item)}
                                disabled={completeMutation.isPending}
                              >
                                <CheckCircle2 className="size-3.5" /> <span>Mark as Completed</span>
                              </DropdownMenuItem>
                            )}
                            {canCreateNextFollowUp(item) && (
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 p-2 text-xs font-medium text-brand-green-strong"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFollowUpModal(businessId);
                                }}
                                onSelect={() => openFollowUpModal(businessId)}
                              >
                                <Plus className="size-3.5" /> <span>Schedule Next Follow-up</span>
                              </DropdownMenuItem>
                            )}
                            {canCancelFollowUp(item) && (
                              <DropdownMenuItem
                                className="mt-1 cursor-pointer gap-2 p-2 text-xs font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCancellingFollowUp(item);
                                }}
                                onSelect={() => setCancellingFollowUp(item)}
                              >
                                <Trash2 className="size-3.5" /> <span>Cancel Follow-up</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {followUps.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No follow-ups yet. Add a follow-up to start tracking the next touchpoint.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CancelFollowUpDialog
        open={Boolean(cancellingFollowUp)}
        businessName={cancellingFollowUp?.businessName || "this business"}
        loading={cancelMutation.isPending}
        onOpenChange={(open) => { if (!open) setCancellingFollowUp(null); }}
        onConfirm={() => void cancelFollowUp()}
      />
      <FollowUpNotesDialog
        readOnly={readOnly}
        followUpId={notesFollowUp?.id}
        followUpName={
          notesFollowUp
            ? `${notesFollowUp.businessName} · ${formatScheduledAt(notesFollowUp.scheduledAt)}`
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
