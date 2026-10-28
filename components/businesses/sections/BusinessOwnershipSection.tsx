"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import FieldLabel from "@/components/businesses/FieldLabel";
import type { BusinessFormValues } from "@/lib/business/form-types";

export default function BusinessOwnershipSection() {
  const { control, setValue } = useFormContext<BusinessFormValues>();
  const assignToName = useWatch({ control, name: "assignToName" });
  const scheduleFollowUp = useWatch({ control, name: "scheduleFollowUp" });

  return (
    <Controller
      control={control}
      name="assignTo"
      rules={{ validate: (value) => !scheduleFollowUp || Boolean(value) || "Choose an owner for the follow-up." }}
      render={({ field, fieldState }) => (
        <div className="max-w-xl">
          <FieldLabel optional={!scheduleFollowUp} required={scheduleFollowUp} invalid={Boolean(fieldState.error)}>Owner</FieldLabel>
          <AssigneeAutocomplete
            value={field.value}
            label={assignToName || ""}
            onChange={(option) => {
              field.onChange(option?.id ?? "");
              setValue("assignToName", option?.label ?? "", { shouldDirty: true });
            }}
            invalid={Boolean(fieldState.error)}
          />
          <p className="mt-1.5 text-xs text-muted">The team member who owns and manages this business.</p>
          {fieldState.error && <p role="alert" className="mt-1 text-xs text-bad">{fieldState.error.message}</p>}
        </div>
      )}
    />
  );
}
