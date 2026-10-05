"use client";

import { Controller, useForm } from "react-hook-form";
import { Dialog as DialogPrimitive } from "radix-ui";
import { CalendarDays, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import FollowUpReminderSelect from "@/components/common/FollowUpReminderSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFollowUp } from "@/hooks/use-follow-ups";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { fromDateTimeLocalValue } from "@/lib/forms/date-time";
import { parseReminderToMinutes } from "@/lib/follow-ups/api";
import {
  FOLLOW_UP_REMINDER_OPTIONS,
  type FollowUpItem,
  type FollowUpOption,
} from "@/types/follow-up";

interface NextFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: FollowUpItem;
}

interface NextFollowUpFormValues {
  assignee: FollowUpOption | null;
  scheduledAt: string;
  reminder: string;
  notes: string;
}

const reminderOptions = FOLLOW_UP_REMINDER_OPTIONS.map((option) => ({
  value: option,
  label: option,
}));

function NextFollowUpForm({
  followUp,
  onOpenChange,
}: {
  followUp: FollowUpItem;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useCreateFollowUp();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NextFollowUpFormValues>({
    defaultValues: {
      assignee: followUp.assignedToId
        ? { id: followUp.assignedToId, label: followUp.assignedToName }
        : null,
      scheduledAt: "",
      reminder: "",
      notes: "",
    },
    mode: "onChange",
  });

  const submit = async (values: NextFollowUpFormValues) => {
    const scheduledAt = fromDateTimeLocalValue(values.scheduledAt);
    if (!scheduledAt || !values.assignee?.id) return;

    try {
      await mutation.mutateAsync({
        businessId: followUp.businessId,
        assignedTo: values.assignee.id,
        type: followUp.type || "CALL",
        scheduledAt,
        notes: values.notes.trim() || undefined,
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

      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="space-y-4"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="next-follow-up-date"
              className="mb-1.5 block text-xs font-semibold text-[#475569]"
            >
              Date &amp; Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-2.5 size-3.5 text-[#64748b]" />
              <Input
                id="next-follow-up-date"
                type="datetime-local"
                aria-invalid={Boolean(errors.scheduledAt)}
                {...register("scheduledAt", {
                  required: "Follow-up date is required.",
                  validate: (value) =>
                    Boolean(fromDateTimeLocalValue(value)) ||
                    "Enter a valid date and time.",
                })}
                className="h-10 pl-9 text-xs"
              />
            </div>
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

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
            Reminder
          </label>
          <Controller
            control={control}
            name="reminder"
            render={({ field }) => (
              <FollowUpReminderSelect
                value={field.value}
                onChange={field.onChange}
                options={reminderOptions}
                placeholder="No reminder"
                emptyOption={{ value: "none", label: "No reminder" }}
                showIcon
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="next-follow-up-notes"
            className="mb-1.5 block text-xs font-semibold text-[#475569]"
          >
            Notes
          </label>
          <Textarea
            id="next-follow-up-notes"
            {...register("notes")}
            placeholder="Add notes for this next follow-up..."
            className="min-h-24 text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-[#eef2f6] pt-4">
          <DialogPrimitive.Close asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogPrimitive.Close>
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 bg-[#027a48] text-white hover:bg-[#05603a]"
          >
            {isPending ? (
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
