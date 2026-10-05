"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, MoreVertical, X } from "lucide-react";
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
  const businessId =
    propBusinessId ??
    (Array.isArray(params?.id) ? params.id[0] : params?.id ?? "");
  const { data: followUps = [], isLoading, isError } =
    useBusinessFollowUpsQuery(businessId);
  const { openFollowUpModal } = useModalStore();
  const [cancellingFollowUp, setCancellingFollowUp] =
    useState<FollowUpItem | null>(null);
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

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading follow-ups...</div>;
  }
  if (isError) {
    return <div className="p-6 text-red-500">Failed to load follow-ups.</div>;
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Follow-ups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs font-semibold text-slate-500">
              <tr>
                <th className="pb-3 pr-4">Follow-up Date</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="w-1/3 pb-3 pr-4">Notes</th>
                <th className="pb-3 pr-4">Assigned To</th>
                <th className="pb-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {followUps.map((item) => {
                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap py-4 pr-4 font-medium text-slate-900">
                      {formatScheduledAt(item.scheduledAt)}
                    </td>
                    <td className="py-4 pr-4 font-medium text-slate-600">
                      {item.type}
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge
                        status={item.status}
                        className="uppercase tracking-wider text-[10px]"
                      />
                    </td>
                    <td className="w-1/3 py-4 pr-4 text-slate-500">
                      {item.notes || "No notes"}
                    </td>
                    <td className="py-4 pr-4 text-slate-600">
                      {item.assignedToName || "Unassigned"}
                    </td>
                    <td className="py-4 pl-4 text-right">
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
                                className="cursor-pointer rounded-md p-2 text-xs font-medium text-emerald-700"
                                onClick={() => void completeFollowUp(item)}
                                disabled={completeMutation.isPending}
                              >
                                Mark as Completed
                              </DropdownMenuItem>
                          )}
                          {canCreateNextFollowUp(item) && (
                            <DropdownMenuItem
                              className="cursor-pointer rounded-md p-2 text-xs font-medium text-emerald-700"
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
                    </td>
                  </tr>
                );
              })}
              {followUps.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-500"
                  >
                    No follow-ups found.
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
    </>
  );
}
