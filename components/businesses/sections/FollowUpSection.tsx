"use client";

import { Controller, useFormContext } from "react-hook-form";
import FieldLabel from "@/components/businesses/FieldLabel";
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
    formState: { errors },
  } = useFormContext<BusinessFormValues>();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <p role="alert" className="mt-1 text-xs text-bad">
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
              minDate={new Date()}
              invalid={Boolean(errors.nextFollowupDate)}
            />
            {errors.nextFollowupDate && (
              <p role="alert" className="mt-1 text-xs text-bad">
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
