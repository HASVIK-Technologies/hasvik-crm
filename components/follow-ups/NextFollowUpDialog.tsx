"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Bell, CalendarDays, Loader2, Search, X } from "lucide-react";
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
import { useCreateFollowUp } from "@/hooks/use-follow-ups";
import {
  FOLLOW_UP_REMINDER_OPTIONS,
  type FollowUpItem,
} from "@/types/follow-up";
import { getApiErrorMessage } from "@/lib/api-error";

interface NextFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: FollowUpItem;
}

function NextFollowUpForm({
  followUp,
  onOpenChange,
}: {
  followUp: FollowUpItem;
  onOpenChange: (open: boolean) => void;
}) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [reminder, setReminder] = useState("");
  const [notes, setNotes] = useState("");
  const mutation = useCreateFollowUp();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scheduledAt) {
      toast.error("Please select a date and time for the next follow-up.");
      return;
    }

    try {
      await mutation.mutateAsync({
        businessId: followUp.businessId,
        assignedTo: followUp.assignedToId || "admin",
        type: followUp.type || "CALL",
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: notes.trim() || undefined,
        reminder: reminder === "none" ? undefined : reminder || undefined,
      });
      toast.success("Next follow-up scheduled successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "Unable to schedule next follow-up.");
    }
  };

  return (
    <>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <DialogPrimitive.Title className="text-lg font-bold text-[#0f172a]">
            Schedule Next Follow-Up
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-xs text-[#64748b]">
            Set up the next touchpoint for this completed follow-up.
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
        {/* Business Name (Disabled / Read-only) */}
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
              title="Business name is prefilled from the completed follow-up"
              className="h-10 w-full cursor-not-allowed border-[#e2e8f0] bg-[#f8fafc] pl-9 text-xs font-medium text-[#0f172a] select-none focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Date & Time and Reminder (2 columns) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Date & Time */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Date &amp; Time
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

          {/* Reminder */}
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
                  <Bell className="size-3.5 text-[#64748b]" />
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
            placeholder="Add notes for this next follow-up..."
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
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="gap-2 bg-[#027a48] text-white hover:bg-[#05603a]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Scheduling...
              </>
            ) : (
              "Schedule Next Follow-Up"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function NextFollowUpDialog({
  open,
  onOpenChange,
  followUp,
}: NextFollowUpDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0f172a]/35 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl outline-none">
          {open && (
            <NextFollowUpForm
              key={`next-${followUp.id}`}
              followUp={followUp}
              onOpenChange={onOpenChange}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
