"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldLabel from "@/components/businesses/FieldLabel";
import LabeledSelect from "@/components/businesses/LabeledSelect";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import {
  LEAD_SOURCE_OPTIONS,
  REMINDER_OPTIONS,
} from "@/lib/business-form-options";
import type { BusinessFormValues } from "@/lib/business-form-types";

export default function FollowUpSection({
  idPrefix = "",
}: {
  idPrefix?: string;
}) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<BusinessFormValues>();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      <Controller
        control={control}
        name="leadSource"
        rules={{ required: "Follow-up type is required." }}
        render={({ field, fieldState }) => (
          <div>
            <LabeledSelect
              label="Follow-up Type"
              placeholder="Select follow-up type"
              options={LEAD_SOURCE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              required
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
              label={field.value}
              onChange={(option) => field.onChange(option?.id ?? "")}
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
          <LabeledSelect
            label="Reminder"
            placeholder="Select reminder"
            options={REMINDER_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <div className="sm:col-span-2 lg:col-span-4">
        <FieldLabel htmlFor={`${idPrefix}notes`}>Notes</FieldLabel>
        <Textarea
          id={`${idPrefix}notes`}
          placeholder="Add any additional notes..."
          {...register("notes")}
        />
      </div>
    </div>
  );
}
