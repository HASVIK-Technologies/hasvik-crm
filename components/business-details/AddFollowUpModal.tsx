import React, { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { CalendarDays, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FollowUpAutocomplete from "@/components/follow-ups/FollowUpAutocomplete";
import { useCreateFollowUp } from "@/hooks/use-business-add-follow-ups";
import { useModalStore } from "@/store/business-modal-store";
import type { FollowUpOption, FollowUpType } from "@/types/follow-up";

// We now ask for the businessName as a prop so we can display it!
interface Props {
  businessName: string;
}

export function AddFollowUpModal({ businessName }: Props) {
  const { isFollowUpModalOpen, closeFollowUpModal, activeBusinessId } = useModalStore();
  
  const [assignee, setAssignee] = useState<FollowUpOption>();
  const [scheduledAt, setScheduledAt] = useState("");
  const [type, setType] = useState<FollowUpType>("CALL");
  const [reminder, setReminder] = useState("Before 15 Minutes");
  const [notes, setNotes] = useState("");
  
  const mutation = useCreateFollowUp();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeBusinessId || !assignee?.id || !scheduledAt) {
      toast.error("Assignee and date are required.");
      return;
    }
    
    try {
      await mutation.mutateAsync({
        businessId: activeBusinessId,
        assignedTo: assignee.id,
        type,
        scheduledAt: new Date(scheduledAt).toISOString(),
        status: "SCHEDULED",
        notes, 
      });
      // Clear the form on success
      closeFollowUpModal();
      setAssignee(undefined);
      setScheduledAt("");
      setNotes("");
    } catch {
      // The hook handles the error toast automatically
    }
  };

  return (
    <DialogPrimitive.Root open={isFollowUpModalOpen} onOpenChange={closeFollowUpModal}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0f172a]/35" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl outline-none">
          
          <div className="mb-5 flex items-start justify-between">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold text-[#0f172a]">
                Add Follow-up
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-[#64748b]">
                Schedule the next touchpoint for a business.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button type="button" className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#f1f5f9]">
                <X className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={submit} className="space-y-4">
            
            {/* 1. Fixed Business Name (Read-Only) */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">Business</label>
              <Input value={businessName || "Loading..."} readOnly className="h-10 bg-[#f8fafc] text-xs font-medium text-[#0f172a]" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* 2. Date */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#475569]">Follow-up date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-2.5 size-3.5 text-[#64748b]" />
                  <Input required type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="h-10 pl-9 text-xs" />
                </div>
              </div>
              
              {/* 3. Assigned To (Using the component!) */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#475569]">Assigned to</label>
                <FollowUpAutocomplete kind="user" value={assignee?.id} label={assignee?.label} onChange={setAssignee} placeholder="Select team member" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* 4. Type Dropdown */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#475569]">Type</label>
                <Select value={type} onValueChange={(v) => setType(v as FollowUpType)}>
                  <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="CALL">Call</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Reminder (Replaced Status!) */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#475569]">Reminder</label>
                <Select value={reminder} onValueChange={setReminder}>
                  <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Before 15 Minutes">Before 15 Minutes</SelectItem>
                    <SelectItem value="Before 1 Hour">Before 1 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 6. Notes Textarea */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Discuss pricing and product requirements..." className="min-h-24 text-xs" />
            </div>

            <div className="flex justify-end gap-2 border-t border-[#eef2f6] pt-4">
              <Button type="button" variant="outline" onClick={closeFollowUpModal}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                {mutation.isPending ? "Adding..." : "Add Follow-up"}
              </Button>
            </div>

          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}