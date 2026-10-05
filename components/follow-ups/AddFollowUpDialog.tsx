"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Bell, CalendarDays, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FollowUpAutocomplete from "@/components/follow-ups/FollowUpAutocomplete";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import FollowUpTypeSelect from "@/components/common/FollowUpTypeSelect";
import FollowUpReminderSelect from "@/components/common/FollowUpReminderSelect";
import { useCreateFollowUp } from "@/hooks/use-follow-ups";
import {
  FOLLOW_UP_REMINDER_OPTIONS,
  type FollowUpReminder,
  type FollowUpOption,
  type FollowUpType,
} from "@/types/follow-up";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBusiness?: FollowUpOption;
}

interface AddFollowUpFormValues {
  business: FollowUpOption | null;
  assignee: FollowUpOption | null;
  scheduledAt: string;
  type: FollowUpType | "";
  notes: string;
  reminder: FollowUpReminder | null;
}

const defaultValues: AddFollowUpFormValues = {
  business: null,
  assignee: null,
  scheduledAt: "",
  type: "",
  notes: "",
  reminder: null,
};

export default function AddFollowUpDialog({
  open,
  onOpenChange,
  initialBusiness,
}: Props) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddFollowUpFormValues>({
    defaultValues: {
      ...defaultValues,
      business: initialBusiness ?? null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({
        ...defaultValues,
        business: initialBusiness ?? null,
      });
    }
  }, [open, initialBusiness, reset]);

  const mutation = useCreateFollowUp();

  const submit = async (values: AddFollowUpFormValues) => {
    const activeBusiness = initialBusiness || values.business;
    if (!activeBusiness?.id || !values.assignee?.id || !values.type || !values.scheduledAt) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      await mutation.mutateAsync({
        businessId: activeBusiness.id,
        assignedTo: values.assignee.id,
        type: values.type,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        notes: values.notes.trim() || undefined,
        reminder: values.reminder || undefined,
      });
      toast.success("Follow-up created successfully");
      onOpenChange(false);
      reset({
        ...defaultValues,
        business: initialBusiness ?? null,
      });
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Unable to add follow-up.",
      );
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0f172a]/35 backdrop-blur-[2px]" />
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
                Business <span className="text-red-500">*</span>
              </label>
              {initialBusiness ? (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 size-4 text-[#94a3b8]" />
                  <Input
                    readOnly
                    tabIndex={-1}
                    value={initialBusiness.label}
                    className="h-10 w-full cursor-not-allowed border-[#e2e8f0] bg-[#f8fafc] pl-9 text-xs font-medium text-[#0f172a] select-none focus-visible:ring-0"
                  />
                </div>
              ) : (
                <>
                  <Controller
                    control={control}
                    name="business"
                    rules={{
                      validate: (value) =>
                        Boolean(value?.id) || "Business is required.",
                    }}
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
                  {errors.business && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {errors.business.message}
                    </p>
                  )}
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
                    options={FOLLOW_UP_REMINDER_OPTIONS.map((option) => ({
                      value: option,
                      label: option,
                    }))}
                    emptyOption={{ value: "none", label: "No reminder" }}
                    placeholder="No reminder"
                    showIcon
                    onChange={(val) =>
                      field.onChange(val === "none" ? null : val)
                    }
                    invalid={Boolean(errors.reminder)}
                  />
                )}
              />
            </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                Notes
              </label>
              <Textarea
                {...register("notes")}
                placeholder="Discuss pricing and product requirements"
                className="min-h-24 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#eef2f6] pt-4">
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogPrimitive.Close>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Adding...
                  </>
                ) : (
                  "Add Follow-up"
                )}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
