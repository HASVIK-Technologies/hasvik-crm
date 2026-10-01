"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Bell, Loader2, Save, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FollowUpAutocomplete from "@/components/follow-ups/FollowUpAutocomplete";
import { useUpdateFollowUp } from "@/hooks/use-follow-ups";
import {
  FOLLOW_UP_REMINDER_OPTIONS,
  type FollowUpItem,
  type FollowUpOption,
  type FollowUpType,
} from "@/types/follow-up";

interface FollowUpEditDialogProps {
  followUp: FollowUpItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FollowUpEditDialog({
  followUp,
  open,
  onOpenChange,
}: FollowUpEditDialogProps) {
  const [assignee, setAssignee] = useState<FollowUpOption | undefined>(
    followUp.assignedToId
      ? { id: followUp.assignedToId, label: followUp.assignedToName }
      : undefined,
  );
  const [scheduledAt, setScheduledAt] = useState(
    followUp.scheduledAt
      ? new Date(followUp.scheduledAt).toISOString().slice(0, 16)
      : "",
  );
  const [type, setType] = useState<FollowUpType>(
    (followUp.type as FollowUpType) || "CALL",
  );
  const [status, setStatus] = useState(followUp.status);
  const [reminder, setReminder] = useState(followUp.reminder ?? "");
  const [notes, setNotes] = useState(followUp.notes ?? "");

  // Sync state whenever followUp changes or dialog opens
  useEffect(() => {
    if (open) {
      setAssignee(
        followUp.assignedToId
          ? { id: followUp.assignedToId, label: followUp.assignedToName }
          : undefined,
      );
      setScheduledAt(
        followUp.scheduledAt
          ? new Date(followUp.scheduledAt).toISOString().slice(0, 16)
          : "",
      );
      setType((followUp.type as FollowUpType) || "CALL");
      setStatus(followUp.status);
      setReminder(followUp.reminder ?? "");
      setNotes(followUp.notes ?? "");
    }
  }, [followUp, open]);

  const mutation = useUpdateFollowUp();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assignee?.id || !scheduledAt) {
      toast.error("Assignee and scheduled date are required.");
      return;
    }
    try {
      await mutation.mutateAsync({
        id: followUp.id,
        followUpId: followUp.id,
        businessId: followUp.businessId,
        assignedTo: assignee.id,
        type,
        scheduledAt: new Date(scheduledAt).toISOString(),
        status,
        notes,
        reminder: reminder || undefined,
      });
      toast.success("Follow-up updated");
      onOpenChange(false);
    } catch {
      toast.error("Unable to update follow-up.");
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#e4ecf2] bg-white p-6 shadow-2xl outline-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#eef2f6] pb-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold text-[#0f172a]">
                Edit follow-up
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-[#64748b]">
                Reschedule, reassign, or update the notes.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#f1f5f9]"
              >
                <X className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Single-Column Vertical Form */}
          <form onSubmit={submit} className="mt-5 space-y-4">
            {/* 1. Business (Read-Only) */}
            <div>
              <label className="block text-xs font-semibold text-[#475569]">
                Business
              </label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-3 size-4 text-[#94a3b8]" />
                <Input
                  readOnly
                  tabIndex={-1}
                  value={followUp.businessName}
                  title="Business cannot be changed from the edit follow-up flow"
                  className="h-10 w-full cursor-not-allowed border-[#e2e8f0] bg-[#f8fafc] pl-9 text-xs font-medium text-[#0f172a] select-none focus-visible:ring-0"
                />
              </div>
            </div>

            {/* 2. Assigned to */}
            <div>
              <label className="block text-xs font-semibold text-[#475569]">
                Assigned to
              </label>
              <div className="mt-1.5">
                <FollowUpAutocomplete
                  kind="user"
                  value={assignee?.id}
                  label={assignee?.label}
                  onChange={setAssignee}
                  placeholder="Select team member"
                />
              </div>
            </div>

            {/* 3. Scheduled Date */}
            <div>
              <label className="block text-xs font-semibold text-[#475569]">
                Scheduled date
              </label>
              <Input
                required
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="mt-1.5 h-10 w-full text-xs"
              />
            </div>

            {/* 4. Type */}
            <div>
              <label className="block text-xs font-semibold text-[#475569]">
                Type
              </label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as FollowUpType)}
              >
                <SelectTrigger className="mt-1.5 h-10 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="CALL">Call</SelectItem>
                  <SelectItem value="MEETING">Meeting</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 5. Status */}
            <div>
              <label className="block text-xs font-semibold text-[#475569]">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1.5 h-10 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 6. Reminder */}
            <div>
              <label className="block text-xs font-semibold text-[#475569]">
                Reminder
              </label>
              <Select
                value={reminder || "none"}
                onValueChange={(val) => setReminder(val === "none" ? "" : val)}
              >
                <SelectTrigger className="mt-1.5 h-10 w-full text-xs">
                  <div className="flex items-center gap-2">
                    <Bell className="size-3.5 text-[#94a3b8]" />
                    <SelectValue placeholder="No reminder" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">No reminder</SelectItem>
                  {FOLLOW_UP_REMINDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 7. Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#475569]">
                Notes
              </label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add notes about this follow-up..."
                className="mt-1.5 min-h-28 w-full text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 border-t border-[#eef2f6] pt-4">
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogPrimitive.Close>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save changes
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
