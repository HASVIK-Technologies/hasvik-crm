"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dialog as DialogPrimitive } from "radix-ui";
import { CalendarDays, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import FollowUpReminderSelect from "@/components/common/FollowUpReminderSelect";
import FollowUpTypeSelect from "@/components/common/FollowUpTypeSelect";
import FollowUpAutocomplete from "@/components/follow-ups/FollowUpAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFollowUp, useUpdateFollowUp } from "@/hooks/use-follow-ups";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "@/lib/forms/date-time";
import { parseReminderToMinutes } from "@/lib/follow-ups/api";
import {
  FOLLOW_UP_REMINDER_OPTIONS,
  type FollowUpItem,
  type FollowUpOption,
  type FollowUpType,
} from "@/types/follow-up";

interface FollowUpFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBusiness?: FollowUpOption;
  followUp?: FollowUpItem;
}

interface FormValues {
  business: FollowUpOption | null;
  assignee: FollowUpOption | null;
  scheduledAt: string;
  type: FollowUpType | "";
  reminder: string;
  notes: string;
}

const emptyValues: FormValues = {
  business: null,
  assignee: null,
  scheduledAt: "",
  type: "",
  reminder: "",
  notes: "",
};

function getDefaultValues(
  mode: "create" | "edit",
  initialBusiness?: FollowUpOption,
  followUp?: FollowUpItem,
): FormValues {
  if (mode === "edit" && followUp) {
    return {
      business: { id: followUp.businessId, label: followUp.businessName },
      assignee: followUp.assignedToId
        ? { id: followUp.assignedToId, label: followUp.assignedToName }
        : null,
      scheduledAt: toDateTimeLocalValue(followUp.scheduledAt),
      type: (followUp.type as FollowUpType) || "CALL",
      reminder: followUp.reminder ?? "",
      notes: followUp.notes ?? "",
    };
  }
  return { ...emptyValues, business: initialBusiness ?? null };
}

export default function FollowUpFormDialog({
  mode,
  open,
  onOpenChange,
  initialBusiness,
  followUp,
}: FollowUpFormDialogProps) {
  const createMutation = useCreateFollowUp();
  const updateMutation = useUpdateFollowUp();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: getDefaultValues(mode, initialBusiness, followUp),
    mode: "onChange",
  });

  useEffect(() => {
    if (open) reset(getDefaultValues(mode, initialBusiness, followUp));
  }, [mode, open, initialBusiness, followUp, reset]);

  const submit = async (values: FormValues) => {
    const scheduledAt = fromDateTimeLocalValue(values.scheduledAt);
    const business = mode === "edit"
      ? followUp && { id: followUp.businessId, label: followUp.businessName }
      : initialBusiness ?? values.business;

    if (!scheduledAt || !business?.id || !values.assignee?.id || !values.type) {
      return;
    }

    try {
      if (mode === "edit") {
        if (!followUp) return;
        await updateMutation.mutateAsync({
          id: followUp.id,
          businessId: followUp.businessId,
          assignedTo: values.assignee.id,
          type: values.type,
          scheduledAt,
          notes: values.notes.trim(),
          reminderInMinutes: parseReminderToMinutes(values.reminder),
        });
        toast.success("Follow-up updated successfully.");
      } else {
        await createMutation.mutateAsync({
          businessId: business.id,
          assignedTo: values.assignee.id,
          type: values.type,
          scheduledAt,
          notes: values.notes.trim() || undefined,
          reminder: values.reminder || undefined,
        });
        toast.success("Follow-up created successfully.");
      }
      onOpenChange(false);
      reset(getDefaultValues(mode, initialBusiness, followUp));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isPending =
    isSubmitting || createMutation.isPending || updateMutation.isPending;
  const isEdit = mode === "edit";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0f172a]/35 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl outline-none">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold text-[#0f172a]">
                {isEdit ? "Edit follow-up" : "Add Follow-up"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-[#64748b]">
                {isEdit
                  ? "Reschedule, reassign, or update the notes."
                  : "Schedule the next touchpoint for a business."}
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
          <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                Business {!isEdit && !initialBusiness && <span className="text-red-500">*</span>}
              </label>
              {isEdit || initialBusiness ? (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 size-4 text-[#94a3b8]" />
                  <Input
                    readOnly
                    tabIndex={-1}
                    value={isEdit ? followUp?.businessName ?? "" : initialBusiness?.label ?? ""}
                    className="h-10 w-full cursor-not-allowed border-[#e2e8f0] bg-[#f8fafc] pl-9 text-xs font-medium text-[#0f172a] select-none focus-visible:ring-0"
                  />
                </div>
              ) : (
                <>
                  <Controller
                    control={control}
                    name="business"
                    rules={{ validate: (value) => Boolean(value?.id) || "Business is required." }}
                    render={({ field }) => (
                      <FollowUpAutocomplete
                        kind="business"
                        value={field.value?.id}
                        label={field.value?.label}
                        onChange={(option) => field.onChange(option ?? null)}
                        placeholder="Select business"
                        invalid={Boolean(errors.business)}
                      />
                    )}
                  />
                  {errors.business && <p role="alert" className="mt-1 text-xs text-red-600">{errors.business.message}</p>}
                </>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                  Follow-up date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-2.5 size-3.5 text-[#64748b]" />
                  <Input
                    type="datetime-local"
                    aria-invalid={Boolean(errors.scheduledAt)}
                    {...register("scheduledAt", {
                      required: "Follow-up date is required.",
                      validate: (value) =>
                        Boolean(fromDateTimeLocalValue(value)) || "Enter a valid date and time.",
                    })}
                    className="h-10 pl-9 text-xs"
                  />
                </div>
                {errors.scheduledAt && <p role="alert" className="mt-1 text-xs text-red-600">{errors.scheduledAt.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                  Assigned to <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="assignee"
                  rules={{ validate: (value) => Boolean(value?.id) || "Assignee is required." }}
                  render={({ field }) => (
                    <AssigneeAutocomplete
                      value={field.value?.id}
                      label={field.value?.label}
                      onChange={(option) => field.onChange(option ?? null)}
                      invalid={Boolean(errors.assignee)}
                    />
                  )}
                />
                {errors.assignee && <p role="alert" className="mt-1 text-xs text-red-600">{errors.assignee.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                {errors.type && <p role="alert" className="mt-1 text-xs text-red-600">{errors.type.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#475569]">Reminder</label>
                <Controller
                  control={control}
                  name="reminder"
                  render={({ field }) => (
                    <FollowUpReminderSelect
                      value={field.value || "none"}
                      options={FOLLOW_UP_REMINDER_OPTIONS.map((option) => ({ value: option, label: option }))}
                      emptyOption={{ value: "none", label: "No reminder" }}
                      placeholder="No reminder"
                      showIcon
                      onChange={(value) => field.onChange(value === "none" ? "" : value)}
                    />
                  )}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">Notes</label>
              <Textarea
                {...register("notes")}
                placeholder="Discuss pricing and product requirements"
                className="min-h-24 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#eef2f6] pt-4">
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogPrimitive.Close>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" />{isEdit ? "Saving..." : "Adding..."}</>
                ) : isEdit ? "Save changes" : "Add Follow-up"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
