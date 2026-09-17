"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FieldLabel from "@/components/businesses/FieldLabel";
import LabeledSelect from "@/components/businesses/LabeledSelect";
import {
  LEAD_SOURCE_OPTIONS,
  REMINDER_OPTIONS,
  TEAM_MEMBER_OPTIONS,
} from "@/lib/business-form-options";
import type { BusinessFormValues } from "@/lib/business-form-types";

export default function FollowUpSection({
  idPrefix = "",
}: {
  idPrefix?: string;
}) {
  const { control, register } = useFormContext<BusinessFormValues>();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      <Controller
        control={control}
        name="leadSource"
        render={({ field }) => (
          <LabeledSelect
            label="Lead Source"
            placeholder="Select lead source"
            options={LEAD_SOURCE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="assignTo"
        render={({ field }) => (
          <LabeledSelect
            label="Assign To"
            placeholder="Select team member"
            options={TEAM_MEMBER_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <div>
        <FieldLabel htmlFor={`${idPrefix}nextFollowupDate`}>
          Next Follow-up Date
        </FieldLabel>
        <Input
          id={`${idPrefix}nextFollowupDate`}
          type="date"
          {...register("nextFollowupDate")}
        />
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
    </div>
  );
}
