"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import FieldLabel from "@/components/businesses/FieldLabel";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import DateTimePicker from "@/components/common/DateTimePicker";
import FollowUpReminderSelect from "@/components/common/FollowUpReminderSelect";
import FollowUpTypeSelect from "@/components/common/FollowUpTypeSelect";
import { REMINDER_OPTIONS } from "@/lib/business/form-options";
import type { BusinessFormValues } from "@/lib/business/form-types";
import { validateFutureDateTime } from "@/lib/forms/date-time";

export default function FollowUpSection({
  idPrefix = "",
}: {
  idPrefix?: string;
}) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<BusinessFormValues>();

  const assignToName = useWatch({ control, name: "assignToName" });

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
              label={assignToName || ""}
              onChange={(option) => {
                field.onChange(option?.id ?? "");
                setValue("assignToName", option?.label ?? "", {
                  shouldDirty: true,
                });
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

      <Controller
        control={control}
        name="nextFollowupDate"
        rules={{
          required: "Follow-up date and time is required.",
          validate: validateFutureDateTime,
        }}
        render={({ field }) => (
          <div>
            <FieldLabel
              htmlFor={`${idPrefix}nextFollowupDate`}
              required
              invalid={Boolean(errors.nextFollowupDate)}
            >
              Date &amp; Time
            </FieldLabel>
            <DateTimePicker
              id={`${idPrefix}nextFollowupDate`}
              value={field.value}
              onChange={field.onChange}
              invalid={Boolean(errors.nextFollowupDate)}
            />
            {errors.nextFollowupDate && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.nextFollowupDate.message}
              </p>
            )}
          </div>
        )}
      />

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
