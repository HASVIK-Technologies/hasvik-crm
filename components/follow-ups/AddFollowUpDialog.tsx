"use client";

import { Controller, useForm } from "react-hook-form";
import { Dialog as DialogPrimitive } from "radix-ui";
import { CalendarDays, X } from "lucide-react";
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
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import { useCreateFollowUp } from "@/hooks/use-follow-ups";
import type { FollowUpOption, FollowUpType } from "@/types/follow-up";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AddFollowUpFormValues {
  business: FollowUpOption | null;
  assignee: FollowUpOption | null;
  scheduledAt: string;
  type: FollowUpType | "";
  notes: string;
}

const defaultValues: AddFollowUpFormValues = {
  business: null,
  assignee: null,
  scheduledAt: "",
  type: "",
  notes: "",
};

export default function AddFollowUpDialog({ open, onOpenChange }: Props) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddFollowUpFormValues>({ defaultValues, mode: "onChange" });
  const mutation = useCreateFollowUp();

  const submit = async (values: AddFollowUpFormValues) => {
    if (!values.business || !values.assignee || !values.type) {
      toast.error("Please complete all required fields.");
      return;
    }
    try {
      await mutation.mutateAsync({
        businessId: values.business.id,
        assignedTo: values.assignee.id,
        type: values.type,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        status: "SCHEDULED",
        notes: values.notes,
      });
      toast.success("Follow-up added");
      onOpenChange(false);
      reset(defaultValues);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Unable to add follow-up.",
      );
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
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
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) =>
                        field.onChange(value as FollowUpType)
                      }
                    >
                      <SelectTrigger
                        className="h-10 text-xs"
                        aria-invalid={Boolean(errors.type)}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="CALL">Call</SelectItem>
                        <SelectItem value="MEETING">Meeting</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
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
                  Status
                </label>
                <Input
                  value="Scheduled"
                  readOnly
                  className="h-10 bg-[#f8fafc] text-xs"
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
                {mutation.isPending ? "Adding..." : "Add Follow-up"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
