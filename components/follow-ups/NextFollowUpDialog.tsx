"use client";

import { useBusinessQuery } from "@/hooks/use-businesses";
import { isRecordInactive } from "@/lib/records/activity";
import { isFollowUpReadOnly } from "@/lib/follow-ups/actions";
import { Controller, useForm } from "react-hook-form";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import DateTimePicker from "@/components/common/DateTimePicker";
import FollowUpReminderSelect from "@/components/common/FollowUpReminderSelect";
import FollowUpTypeSelect from "@/components/common/FollowUpTypeSelect";
import SaveButton from "@/components/common/SaveButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateFollowUp } from "@/hooks/use-follow-ups";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  fromDateTimeLocalValue,
  validateFutureDateTime,
} from "@/lib/forms/date-time";
import { parseReminderToMinutes } from "@/lib/follow-ups/api";
import {
  FOLLOW_UP_REMINDER_OPTIONS,
  type FollowUpItem,
  type FollowUpOption,
  type FollowUpType,
} from "@/types/follow-up";

interface NextFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: FollowUpItem;
}

interface NextFollowUpFormValues {
  assignee: FollowUpOption | null;
  scheduledAt: string;
  type: FollowUpType | "";
  reminder: string;
}

const reminderOptions = FOLLOW_UP_REMINDER_OPTIONS.map((option) => ({
  value: option,
  label: option,
}));

const followUpTypes: FollowUpType[] = [
  "CALL",
  "MEETING",
  "EMAIL",
  "WHATSAPP",
  "OTHER",
];

function normalizeFollowUpType(type: string): FollowUpType {
  const normalizedType = type.trim().toUpperCase().replace(/[\s-]+/g, "_");

  return followUpTypes.includes(normalizedType as FollowUpType)
    ? (normalizedType as FollowUpType)
    : "CALL";
}

function NextFollowUpForm({
  followUp,
  onOpenChange,
}: {
  followUp: FollowUpItem;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useCreateFollowUp();
  const businessQuery = useBusinessQuery(followUp.businessId);
  const readOnly = !businessQuery.data || isRecordInactive(businessQuery.data) || isFollowUpReadOnly(followUp);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NextFollowUpFormValues>({
    defaultValues: {
      assignee: followUp.assignedToId
        ? { id: followUp.assignedToId, label: followUp.assignedToName }
        : null,
      scheduledAt: "",
      type: normalizeFollowUpType(followUp.type),
      reminder: "",
    },
    mode: "onChange",
  });

  const submit = async (values: NextFollowUpFormValues) => {
    if (readOnly) return;
    const scheduledAt = fromDateTimeLocalValue(values.scheduledAt);
    if (!scheduledAt || !values.assignee?.id || !values.type) return;

    try {
      await mutation.mutateAsync({
        businessId: followUp.businessId,
        assignedTo: values.assignee.id,
        type: values.type,
        scheduledAt,
        reminderInMinutes: parseReminderToMinutes(values.reminder),
      });
      toast.success("Next follow-up scheduled successfully.");
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isPending = isSubmitting || mutation.isPending;

  return (
    <>
      <header className="sticky top-0 z-10 mb-5 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
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
            className="border border-transparent p-1.5 text-[#64748b] hover:border-slate-200 hover:bg-[#f1f5f9]"
          >
            <X className="size-4" />
          </button>
        </DialogPrimitive.Close>
      </header>

      {readOnly && <p className="px-5 pb-5 text-xs text-slate-500">An active business is required to schedule another follow-up.</p>}
      {!readOnly && <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="space-y-5 px-5 sm:px-6"
      >
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="next-follow-up-date"
              className="mb-1.5 block text-xs font-semibold text-[#475569]"
            >
              Date &amp; Time <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="scheduledAt"
              rules={{
                required: "Follow-up date is required.",
                validate: validateFutureDateTime,
              }}
              render={({ field }) => (
                <DateTimePicker
                  id="next-follow-up-date"
                  value={field.value}
                  onChange={field.onChange}
                  invalid={Boolean(errors.scheduledAt)}
                />
              )}
            />
            {errors.scheduledAt && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.scheduledAt.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Assigned to <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="assignee"
              rules={{
                validate: (value) =>
                  Boolean(value?.id) || "Assignee is required.",
              }}
              render={({ field }) => (
                <AssigneeAutocomplete
                  value={field.value?.id}
                  label={field.value?.label}
                  onChange={(option) => field.onChange(option ?? null)}
                  invalid={Boolean(errors.assignee)}
                />
              )}
            />
            {errors.assignee && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.assignee.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Type <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="type"
              rules={{ required: "Follow-up type is required." }}
              render={({ field }) => (
                <FollowUpTypeSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select type"
                  invalid={Boolean(errors.type)}
                />
              )}
            />
            {errors.type && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.type.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Reminder
            </label>
            <Controller
              control={control}
              name="reminder"
              render={({ field }) => (
                <FollowUpReminderSelect
                  value={field.value || "none"}
                  onChange={(value) =>
                    field.onChange(value === "none" ? "" : value)
                  }
                  options={reminderOptions}
                  placeholder="No reminder"
                  emptyOption={{ value: "none", label: "No reminder" }}
                  showIcon
                />
              )}
            />
          </div>
        </div>

        <footer className="sticky bottom-0 z-10 -mx-5 flex flex-col-reverse justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:-mx-6 sm:flex-row sm:px-6">
          <DialogPrimitive.Close asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogPrimitive.Close>
          <SaveButton
            type="submit"
            disabled={isPending || readOnly}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Scheduling...
              </>
            ) : (
              "Schedule Next Follow-Up"
            )}
          </SaveButton>
        </footer>
      </form>}
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
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-slate-200 bg-white shadow-2xl outline-none">
          <NextFollowUpForm
            key={`next-${followUp.id}`}
            followUp={followUp}
            onOpenChange={onOpenChange}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
