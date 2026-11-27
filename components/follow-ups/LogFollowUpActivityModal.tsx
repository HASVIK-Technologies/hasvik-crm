"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  AlertCircle,
  Ban,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Info,
  Loader2,
  Mail,
  Phone,
  PhoneOff,
  Play,
  Power,
  Save,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateFollowUpNote } from "@/hooks/use-follow-up-notes";
import { useCompleteFollowUp } from "@/hooks/use-follow-ups";
import { useBusinessQuery, useUpdateBusinessLeadStatus } from "@/hooks/use-businesses";
import { followUpQueryKeys } from "@/lib/query/query-keys";
import type { FollowUpItem } from "@/types/follow-up";
import { STATUS_OPTIONS } from "@/lib/business/form-options";

export type FollowUpActionType = "CALL" | "WHATSAPP" | "EMAIL";

interface OutcomeOption {
  id: string;
  label: string;
  icon: (isSelected: boolean) => React.ReactNode;
}

const CALL_OUTCOMES: OutcomeOption[] = [
  {
    id: "CONNECTED",
    label: "Connected",
    icon: (selected) => (
      <Check className={`size-4 stroke-[2.5] ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "NOT_CONNECTED",
    label: "Not Connected",
    icon: (selected) => (
      <Ban className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "BUSY",
    label: "Busy",
    icon: (selected) => (
      <Clock className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "SWITCH_OFF",
    label: "Switch Off",
    icon: (selected) => (
      <Power className={`size-4 ${selected ? "text-white" : "text-[#f97316]"}`} />
    ),
  },
  {
    id: "WRONG_NUMBER",
    label: "Wrong Number",
    icon: (selected) => (
      <PhoneOff className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
];

const WHATSAPP_OUTCOMES: OutcomeOption[] = [
  {
    id: "MESSAGE_SENT",
    label: "Message Sent",
    icon: (selected) => (
      <Check className={`size-4 stroke-[2.5] ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "CUSTOMER_REPLIED",
    label: "Customer Replied",
    icon: (selected) => (
      <Clock className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "NO_RESPONSE",
    label: "No Response",
    icon: (selected) => (
      <Clock className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "UNABLE_TO_SEND",
    label: "Unable to Send",
    icon: (selected) => (
      <Power className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
];

const EMAIL_OUTCOMES: OutcomeOption[] = [
  {
    id: "EMAIL_SENT",
    label: "Email Sent",
    icon: (selected) => (
      <Check className={`size-4 stroke-[2.5] ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "REPLY_RECEIVED",
    label: "Reply Received",
    icon: (selected) => (
      <Play className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "NO_RESPONSE",
    label: "No Response",
    icon: (selected) => (
      <Clock className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "FAILED",
    label: "Failed",
    icon: (selected) => (
      <AlertCircle className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
];

interface CustomerIntentOption {
  id: string;
  label: string;
  icon: (isSelected: boolean) => React.ReactNode;
}

const CUSTOMER_INTENTS: CustomerIntentOption[] = [
  {
    id: "NOT_INTERESTED",
    label: "Not Interested",
    icon: (selected) => (
      <Ban className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "NEED_MORE_INFO",
    label: "Need More Info",
    icon: (selected) => (
      <Info className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "DEMO_REQUEST",
    label: "Demo Request",
    icon: (selected) => (
      <Play className={`size-4 ${selected ? "text-white" : "text-[#0f172a]"}`} />
    ),
  },
  {
    id: "NEXT_FOLLOW_UP",
    label: "Next Follow-up",
    icon: (selected) => (
      <Calendar className={`size-4 ${selected ? "text-white" : "text-[#0066ff]"}`} />
    ),
  },
];

const LEAD_STATUS_CONFIG: Record<string, { label: string; dotClass: string }> = {
  NEW: { label: "New", dotClass: "bg-blue-500" },
  CONTACTED: { label: "Contacted", dotClass: "bg-cyan-500" },
  INTERESTED: { label: "Interested", dotClass: "bg-[#22c55e]" },
  PROPOSAL_AND_NEGOTIATION: { label: "Proposal & Negotiation", dotClass: "bg-violet-500" },
  WON: { label: "Won", dotClass: "bg-[#16a34a]" },
  LOST: { label: "Lost", dotClass: "bg-rose-500" },
};

interface LogFollowUpActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: FollowUpItem;
  actionType: FollowUpActionType;
  onSuccess?: () => void;
}

export default function LogFollowUpActivityModal({
  open,
  onOpenChange,
  followUp,
  actionType,
  onSuccess,
}: LogFollowUpActivityModalProps) {
  const queryClient = useQueryClient();
  const createNoteMutation = useCreateFollowUpNote();
  const updateLeadStatusMutation = useUpdateBusinessLeadStatus();
  const completeMutation = useCompleteFollowUp();

  const businessQuery = useBusinessQuery(
    open ? followUp.businessId : undefined,
  );

  const currentBusinessLeadStatus =
    businessQuery.data?.leadStatus ||
    businessQuery.data?.status ||
    followUp.businessLeadStatus ||
    "INTERESTED";

  const [leadStatus, setLeadStatus] = useState<string>("INTERESTED");
  const [outcome, setOutcome] = useState<string>("");
  const [intent, setIntent] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [markCompleted, setMarkCompleted] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync outcome and lead status on open / actionType change
  useEffect(() => {
    if (open) {
      if (actionType === "CALL") {
        setOutcome("CONNECTED");
      } else if (actionType === "WHATSAPP") {
        setOutcome("MESSAGE_SENT");
      } else {
        setOutcome("EMAIL_SENT");
      }
      setIntent("");
      setNotes("");
      setMarkCompleted(true);
      const normalizedStatus = (currentBusinessLeadStatus || "INTERESTED").toUpperCase().replace(/\s+/g, "_");
      setLeadStatus(STATUS_OPTIONS.some((o) => o.value === normalizedStatus) ? normalizedStatus : "INTERESTED");
    }
  }, [open, actionType, currentBusinessLeadStatus]);

  const outcomes =
    actionType === "CALL"
      ? CALL_OUTCOMES
      : actionType === "WHATSAPP"
        ? WHATSAPP_OUTCOMES
        : EMAIL_OUTCOMES;

  const title =
    actionType === "CALL"
      ? "Call Follow up"
      : actionType === "WHATSAPP"
        ? "WhatsApp Follow up"
        : "Email Follow up";

  const renderHeaderIcon = () => {
    if (actionType === "CALL") {
      return (
        <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-[#0066ff]">
          <Phone className="size-5" />
        </div>
      );
    }
    if (actionType === "WHATSAPP") {
      return (
        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-[#25D366]">
          <WhatsAppIcon className="size-5" />
        </div>
      );
    }
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-[#0066ff]">
        <Mail className="size-5" />
      </div>
    );
  };

  const handleSaveActivity = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const selectedOutcome = outcomes.find((o) => o.id === outcome);
      const selectedIntent = CUSTOMER_INTENTS.find((i) => i.id === intent);

      const noteLines: string[] = [];
      noteLines.push(`[${title}] Outcome: ${selectedOutcome?.label ?? outcome}`);
      if (selectedIntent) {
        noteLines.push(`Customer Intent: ${selectedIntent.label}`);
      }
      if (notes.trim()) {
        noteLines.push(`Notes: ${notes.trim()}`);
      }
      const noteContent = noteLines.join("\n");

      // 1. Create Follow-up note / activity log
      await createNoteMutation.mutateAsync({
        followUpId: followUp.id,
        content: noteContent,
        businessContext: {
          businessId: followUp.businessId,
          scheduledAt: followUp.scheduledAt,
          status: markCompleted ? "COMPLETED" : String(followUp.status),
        },
      });

      // 2. Update Lead Status if changed
      const originalNormalized = (currentBusinessLeadStatus || "").toUpperCase().replace(/\s+/g, "_");
      if (leadStatus && leadStatus !== originalNormalized && followUp.businessId) {
        await updateLeadStatusMutation.mutateAsync({
          id: followUp.businessId,
          status: leadStatus,
        });
      }

      // 3. Complete follow-up if checked
      if (markCompleted && followUp.status !== "COMPLETED") {
        await completeMutation.mutateAsync(followUp.id);
      }

      await queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all });
      toast.success("Activity saved successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to save follow-up activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 sm:p-7 shadow-2xl transition-all duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              {renderHeaderIcon()}
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-[#0f172a]">
                  {title}
                </DialogPrimitive.Title>
                <p className="text-xs text-slate-500">{followUp.businessName}</p>
              </div>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="space-y-4 pt-1">
            {/* Section: Lead Status */}
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <span className="h-4 w-1 rounded-full bg-[#0066ff]" />
                <span className="text-sm font-bold text-[#0f172a]">Lead Status</span>
              </div>
              <Select value={leadStatus} onValueChange={setLeadStatus}>
                <SelectTrigger className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0f172a] shadow-2xs hover:border-slate-400 focus:ring-1 focus:ring-[#0066ff]">
                  <SelectValue placeholder="Select lead status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                  {STATUS_OPTIONS.map((opt) => {
                    const cfg = LEAD_STATUS_CONFIG[opt.value] || { label: opt.label, dotClass: "bg-slate-400" };
                    return (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="cursor-pointer rounded-lg py-2 text-xs font-medium text-[#0f172a] hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`size-2.5 rounded-full ${cfg.dotClass}`} />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Section: Outcome */}
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <span className="h-4 w-1 rounded-full bg-[#0066ff]" />
                <span className="text-sm font-bold text-[#0f172a]">Outcome</span>
                <span className="text-sm font-bold text-[#ef4444] ml-0.5">*</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {outcomes.map((opt) => {
                  const isSelected = outcome === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOutcome(opt.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm transition-all shadow-2xs ${
                        isSelected
                          ? "bg-[#0066ff] text-white font-semibold border border-transparent shadow-xs"
                          : "border border-[#cbd5e1] bg-white text-[#0f172a] font-medium hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {opt.icon(isSelected)}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Customer Intent */}
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <span className="h-4 w-1 rounded-full bg-[#0066ff]" />
                <span className="text-sm font-bold text-[#0f172a]">Customer Intent</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CUSTOMER_INTENTS.map((opt) => {
                  const isSelected = intent === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIntent(isSelected ? "" : opt.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm transition-all shadow-2xs ${
                        isSelected
                          ? "bg-[#0066ff] text-white font-semibold border border-transparent shadow-xs"
                          : "border border-[#cbd5e1] bg-white text-[#0f172a] font-medium hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {opt.icon(isSelected)}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Notes */}
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <span className="h-4 w-1 rounded-full bg-[#0066ff]" />
                <span className="text-sm font-bold text-[#0f172a]">Notes</span>
              </div>
              <div className="relative rounded-xl border border-[#cbd5e1] bg-white p-3 shadow-2xs focus-within:border-[#0066ff] focus-within:ring-1 focus-within:ring-[#0066ff] transition-all">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  placeholder="Add your conversation notes here..."
                  maxLength={500}
                  rows={3}
                  className="w-full bg-transparent p-0 text-sm text-[#0f172a] placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed border-none"
                />
                <div className="pt-1 text-right text-xs text-slate-400">
                  {notes.length} / 500
                </div>
              </div>
            </div>

            {/* Mark as Completed */}
            <div className="flex items-center gap-2.5 pt-1">
              <Checkbox
                id="mark-completed-checkbox"
                checked={markCompleted}
                onCheckedChange={(checked) => setMarkCompleted(Boolean(checked))}
                className="size-4.5 rounded-[5px] border-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
              />
              <label
                htmlFor="mark-completed-checkbox"
                className="cursor-pointer text-sm font-semibold text-[#0f172a] select-none"
              >
                Mark this follow-up as Completed
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl border border-[#0066ff] bg-white px-6 py-2.5 text-sm font-semibold text-[#0066ff] hover:bg-blue-50 transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveActivity}
              disabled={isSubmitting || !outcome}
              className="flex items-center gap-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>{isSubmitting ? "Saving..." : "Save Activity"}</span>
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
