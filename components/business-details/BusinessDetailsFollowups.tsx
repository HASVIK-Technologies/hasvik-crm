import React from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Phone, MoreVertical } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { useBusinessFollowUpsQuery } from "@/hooks/use-business-get-follow-ups";
import Link from "next/link";
import { useModalStore } from "@/store/business-modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelFollowUp, updateFollowUp, updateFollowUpStatus } from "@/lib/follow-up-api";
import { toast } from "sonner";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";



import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BusinessDetailsFollowupsProps = {
  businessId?: string;
};

export default function BusinessDetailsFollowups({
  businessId: propBusinessId,
}: BusinessDetailsFollowupsProps = {}) {
  const [cancellingItem, setCancellingItem] = React.useState<any>(null);
  // 1. Helper to build the full payload so the strict backend accepts it!
  // 1. Build the perfect payload (Added followUpId and reminder!)
  const buildPayload = (item: any, newStatus: string) => ({
    id: item._id,
    followUpId: item._id, // Required by backend!
    businessId: businessId,
    assignedTo: item.assignedTo || item.assignee?._id,
    type: item.type || "CALL",
    scheduledAt: item.scheduledAt,
    status: newStatus,
    notes: Array.isArray(item.notes) && item.notes.length > 0
      ? item.notes[0].content
      : item.notes?.content || (typeof item.notes === 'string' ? item.notes : ""),
    reminder: "15"
  });

  const queryClient = useQueryClient();

  // 2. The Cancel Mutation (Now uses our fixed DELETE API!)
  const cancelMutation = useMutation({
    mutationFn: (item: any) => updateFollowUpStatus({ id: item._id, status: "CANCELLED" }),
    onSuccess: () => {
      toast.success("Follow-up cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["followUps", businessId] });
      setCancellingItem(null);
    },
    onError: () => toast.error("Failed to cancel follow-up.")
  });

  const completeMutation = useMutation({
    mutationFn: (item: any) => updateFollowUpStatus({ id: item._id, status: "COMPLETED" }),
    onSuccess: () => {
      toast.success("Follow-up marked as completed!");
      queryClient.invalidateQueries({ queryKey: ["followUps", businessId] });
    },
    onError: () => toast.error("Failed to complete follow-up.")
  });
  const { openFollowUpModal } = useModalStore();
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
      case "CANCELLED":
        return "bg-slate-100 text-slate-600 hover:bg-slate-100";
      case "OVERDUE":
        return "bg-red-50 text-red-600 hover:bg-red-50";
      case "SCHEDULED":
      default:
        return "bg-blue-50 text-blue-700 hover:bg-blue-50";
    }
  };
  const params = useParams();
  const businessId =
    propBusinessId ??
    (Array.isArray(params?.id) ? params.id[0] : params?.id ?? "");
  const { data: followUps, isLoading, isError } = useBusinessFollowUpsQuery(
    businessId as string,
  );
  if (isLoading) return <div className="p-6 text-slate-500">Loading follow-ups...</div>;
  if (isError) return <div className="p-6 text-red-500">Failed to load follow-ups.</div>;
  const followUpsList = Array.isArray(followUps) ? followUps : [];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Follow-ups</h3>
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="pb-3 pr-4 font-semibold">Follow-up Date</th>
              <th className="pb-3 pr-4 font-semibold">Type</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
              <th className="pb-3 pr-4 font-semibold w-1/3">Notes</th>
              <th className="pb-3 pr-4 font-semibold">Assigned To</th>
              <th className="pb-3 pl-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>

            {followUpsList.map((item: any) => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 pr-4 font-medium text-slate-900 whitespace-nowrap">
                  {item.scheduledAt
                    ? new Date(item.scheduledAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "-"}
                </td>

                {/* Type */}
                <td className="py-4 pr-4 font-medium text-slate-600">{item.type}</td>
                {/* Dynamic Status Badge */}
                <td className="py-4 pr-4">
                  <Badge variant="secondary" className={`font-semibold border-0 uppercase text-[10px] tracking-wider px-2.5 py-0.5 ${getStatusColor(item.status)}`}>
                    {item.status}
                  </Badge>
                </td>

                {/* Notes */}
                <td className="py-4 pr-4 text-slate-500 w-1/3">
                  {Array.isArray(item.notes) && item.notes.length > 0
                    ? item.notes[0].content
                    : item.notes?.content
                    || (typeof item.notes === 'string' ? item.notes : "No notes")}
                </td>

                {/* Assignee */}
                <td className="py-4 pr-4 text-slate-600">{item.assignee?.fullName || "Unassigned"}</td>

                {/* Actions */}
                <td className="py-4 pl-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md hover:bg-slate-100 outline-none">
                          <MoreVertical className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg rounded-xl p-1.5">

                        {/* Menu Options */}
                        <DropdownMenuItem asChild className="cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-md hover:bg-slate-50">
                          <Link href={`/follow-ups/${item._id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-md hover:bg-slate-50"
                          onClick={() => openFollowUpModal(businessId as string, item)}
                        >
                          Reschedule / Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-md hover:bg-slate-50"
                          onClick={() => {
                            const notesText = Array.isArray(item.notes) && item.notes.length > 0
                              ? item.notes[0].content
                              : item.notes?.content || (typeof item.notes === 'string' ? item.notes : "No notes have been added yet.");
                            alert(`Notes for this Follow-up:\n\n${notesText}`);
                          }}
                        >
                          View Notes
                        </DropdownMenuItem>

                        {/* Cancel Option (Red Text) */}
                        {item.status?.toUpperCase() !== "CANCELLED" && item.status?.toUpperCase() !== "COMPLETED" && (
                          <DropdownMenuItem
                            className="cursor-pointer text-xs font-medium text-red-600 focus:text-red-700 p-2 rounded-md hover:bg-red-50 focus:bg-red-50 mt-1"
                            onClick={() => setCancellingItem(item)}
                          >
                            Cancel Follow-up
                          </DropdownMenuItem>
                        )}
                        {item.status?.toUpperCase() === "CANCELLED" && (
                          <DropdownMenuItem
                            className="cursor-pointer text-xs font-medium text-emerald-700 focus:text-emerald-800 p-2 rounded-md hover:bg-emerald-50 focus:bg-emerald-50 mt-1"
                            onClick={() => completeMutation.mutate(item)}
                            disabled={completeMutation.isPending}
                          >
                            {completeMutation.isPending ? "Updating..." : "Mark as Completed"}
                          </DropdownMenuItem>
                        )}

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}

            {followUpsList.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">No follow-ups found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <DialogPrimitive.Root open={!!cancellingItem} onOpenChange={(open) => !open && setCancellingItem(null)}>
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
                  This will cancel the follow-up for <strong>"{cancellingItem?.businessName || 'this business'}"</strong>. This action cannot be undone.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close asChild>
                <button type="button" className="h-6 w-6 text-slate-400 hover:text-slate-600 shrink-0 flex items-start">
                  <X className="size-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCancellingItem(null)}>
                Keep follow-up
              </Button>
              <Button
                variant="destructive"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(cancellingItem)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel follow-up"}
              </Button>
            </div>

          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}