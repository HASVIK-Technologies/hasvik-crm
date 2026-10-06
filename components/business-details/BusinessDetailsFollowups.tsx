"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  MessageSquareText,
  MoreVertical,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog as DialogPrimitive } from "radix-ui";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";

interface BusinessDetailsFollowupsProps {
  businessId?: string;
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
      event.target.closest("a, button, [role='button'], input, select, textarea")
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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-base font-bold text-slate-900">Follow-up history</h3>
          <p className="text-xs text-slate-500">
            Review scheduled touchpoints, notes, and assigned owners.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 sm:px-6">Date &amp; time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned to</th>
                <th className="px-5 py-3 text-right sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {followUps.map((item) => {
                return (
                  <tr
                    key={item.id}
                    tabIndex={0}
                    aria-label={`Open follow-up details for ${formatScheduledAt(item.scheduledAt)}`}
                    onClick={(event) => handleRowClick(event, item.id)}
                    onKeyDown={(event) => handleRowKeyDown(event, item.id)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900 sm:px-6">
                      {formatScheduledAt(item.scheduledAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge
                        status={item.status}
                        className="rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider"
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {item.assignedToName || "Unassigned"}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`View or add notes for follow-up on ${formatScheduledAt(item.scheduledAt)}`}
                          title="View or add notes"
                          onClick={() => setNotesFollowUp(item)}
                          className="inline-flex size-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <MessageSquareText className="size-4" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label={`Actions for follow-up on ${formatScheduledAt(item.scheduledAt)}`}
                              className="rounded-md p-1.5 outline-none hover:bg-slate-100"
                            >
                              <MoreVertical className="size-4 text-slate-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                          >
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer rounded-md p-2 text-xs font-medium text-slate-700"
                            >
                              <Link href={`/follow-ups/${item.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canEditFollowUp(item) && (
                              <DropdownMenuItem
                                className="cursor-pointer rounded-md p-2 text-xs font-medium text-slate-700"
                                onClick={() =>
                                  openFollowUpModal(businessId, item)
                                }
                              >
                                Reschedule / Edit
                              </DropdownMenuItem>
                            )}
                            {canCompleteFollowUp(item) && (
                              <DropdownMenuItem
                                className="cursor-pointer rounded-md p-2 text-xs font-medium text-brand-green-strong"
                                onClick={() => void completeFollowUp(item)}
                                disabled={completeMutation.isPending}
                              >
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            {canCreateNextFollowUp(item) && (
                              <DropdownMenuItem
                                className="cursor-pointer rounded-md p-2 text-xs font-medium text-brand-green-strong"
                                onClick={() => openFollowUpModal(businessId)}
                              >
                                Schedule Next Follow-up
                              </DropdownMenuItem>
                            )}
                            {canCancelFollowUp(item) && (
                              <DropdownMenuItem
                                className="mt-1 cursor-pointer rounded-md p-2 text-xs font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                                onClick={() => setCancellingFollowUp(item)}
                              >
                                Cancel Follow-up
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {followUps.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No follow-ups yet. Add a follow-up to start tracking the next touchpoint.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DialogPrimitive.Root
        open={Boolean(cancellingFollowUp)}
        onOpenChange={(open) => {
          if (!open) setCancellingFollowUp(null);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0f172a]/35" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl outline-none">
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="size-5 text-red-600" />
              </div>
              <div className="flex-1">
                <DialogPrimitive.Title className="text-lg font-bold text-slate-900">
                  Cancel follow-up?
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-sm text-slate-500">
                  Cancel the follow-up for{" "}
                  <strong>
                    {cancellingFollowUp?.businessName || "this business"}
                  </strong>
                  ? This action cannot be undone.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  aria-label="Close cancel confirmation"
                  className="flex h-6 w-6 shrink-0 items-start text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              </DialogPrimitive.Close>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setCancellingFollowUp(null)}
              >
                Keep follow-up
              </Button>
              <Button
                variant="destructive"
                onClick={() => void cancelFollowUp()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <FollowUpNotesDialog
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
