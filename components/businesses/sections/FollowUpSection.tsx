"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FieldLabel from "@/components/businesses/FieldLabel";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import FollowUpReminderSelect from "@/components/common/FollowUpReminderSelect";
import FollowUpTypeSelect from "@/components/common/FollowUpTypeSelect";
import { REMINDER_OPTIONS } from "@/lib/business/form-options";
import type { BusinessFormValues } from "@/lib/business/form-types";

export default function FollowUpSection({
  idPrefix = "",
}: {
  idPrefix?: string;
}) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<BusinessFormValues>();
  const assigneeName = useWatch({ control, name: "assignToName" });

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      <Controller
        control={control}
        name="followUpType"
        rules={{ required: "Follow-up type is required." }}
        render={({ field, fieldState }) => (
          <div>
            <FieldLabel required invalid={Boolean(fieldState.error)}>
              Follow-up Type
            </FieldLabel>
            <FollowUpTypeSelect
              value={field.value}
              onChange={field.onChange}
              className="w-full"
              invalid={Boolean(fieldState.error)}
            />
            {fieldState.error && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="assignTo"
        rules={{ required: "Assignee is required." }}
        render={({ field, fieldState }) => (
          <div>
            <FieldLabel required invalid={Boolean(fieldState.error)}>
              Assign To
            </FieldLabel>
            <AssigneeAutocomplete
              value={field.value}
              label={assigneeName}
              onChange={(option) => {
                field.onChange(option?.id ?? "");
                setValue("assignToName", option?.label ?? "");
              }}
              invalid={Boolean(fieldState.error)}
            />
            {fieldState.error && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      <div>
        <FieldLabel
          htmlFor={`${idPrefix}nextFollowupDate`}
          required
          invalid={Boolean(errors.nextFollowupDate)}
        >
          Next Follow-up Date
        </FieldLabel>
        <Input
          id={`${idPrefix}nextFollowupDate`}
          type="date"
          aria-invalid={Boolean(errors.nextFollowupDate)}
          {...register("nextFollowupDate", {
            required: "Next follow-up date is required.",
          })}
        />
        {errors.nextFollowupDate && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.nextFollowupDate.message}
          </p>
        )}
      </div>

      <Controller
        control={control}
        name="reminder"
        render={({ field }) => (
          <div>
            <FieldLabel>Reminder</FieldLabel>
            <FollowUpReminderSelect
              options={REMINDER_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className="w-full"
            />
          </div>
        )}
      />

    </div>
  );
}
