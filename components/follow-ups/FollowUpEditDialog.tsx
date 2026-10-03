"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Bell, CalendarDays, Loader2, Save, Search, X } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
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
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
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

function sanitizeNotes(val?: string) {
  return val &&
    val !== "[object Object]" &&
    val !== "null" &&
    val !== "undefined"
    ? val
    : "";
}

function FollowUpEditForm({
  followUp,
  onOpenChange,
}: {
  followUp: FollowUpItem;
  onOpenChange: (open: boolean) => void;
}) {
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
  const [reminder, setReminder] = useState(followUp.reminder ?? "");
  const [notes, setNotes] = useState(sanitizeNotes(followUp.notes));

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
        notes,
        reminder: reminder || undefined,
      });
      toast.success("Follow-up updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "Unable to update follow-up.");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
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
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#f1f5f9]"
          >
            <X className="size-4" />
          </button>
        </DialogPrimitive.Close>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Business */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
            Business
          </label>
          <div className="relative">
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

        {/* Follow-up date & Assigned to */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Follow-up date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-2.5 size-3.5 text-[#64748b]" />
              <Input
                required
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="h-10 pl-9 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Assigned to
            </label>
            <FollowUpAutocomplete
              kind="user"
              value={assignee?.id}
              label={assignee?.label}
              onChange={setAssignee}
              placeholder="Select team member"
            />
          </div>
        </div>

        {/* Type & Reminder */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Type
            </label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as FollowUpType)}
            >
              <SelectTrigger className="h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="CALL">Call</SelectItem>
                <SelectItem value="MEETING">Meeting</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Reminder
            </label>
            <Select
              value={reminder || "none"}
              onValueChange={(val) => setReminder(val === "none" ? "" : val)}
            >
              <SelectTrigger className="h-10 text-xs">
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
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
            Notes
          </label>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Discuss pricing and product requirements"
            className="min-h-24 text-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 border-t border-[#eef2f6] pt-4">
          <DialogPrimitive.Close asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogPrimitive.Close>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function FollowUpEditDialog({
  followUp,
  open,
  onOpenChange,
}: FollowUpEditDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0f172a]/35 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl outline-none">
          {open && (
            <FollowUpEditForm
              key={`${followUp.id}-${followUp.notes}-${followUp.scheduledAt}`}
              followUp={followUp}
              onOpenChange={onOpenChange}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

