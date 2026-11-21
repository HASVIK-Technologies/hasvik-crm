"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import FieldLabel from "@/components/businesses/FieldLabel";
import type { BusinessFormValues } from "@/lib/business/form-types";
import TagSelectionField from "@/components/tags/TagSelectionField";

export default function BusinessOwnershipSection() {
  const { control, setValue } = useFormContext<BusinessFormValues>();
  const assignToName = useWatch({ control, name: "assignToName" });

  return (
    <Controller
      control={control}
      name="assignTo"
      render={({ field, fieldState }) => (
        <div className="grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="min-w-0">
            <FieldLabel htmlFor="business-tags" optional>
              Tags
            </FieldLabel>
            <Controller
              control={control}
              name="tagIds"
              render={({ field: tagField }) => (
                <TagSelectionField
                  id="business-tags"
                  entity="BUSINESS"
                  value={tagField.value ?? []}
                  onChange={tagField.onChange}
                  compact
                />
              )}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Organize this business independently of its lead status.
            </p>
          </div>
          <div className="min-w-0">
            <FieldLabel optional invalid={Boolean(fieldState.error)}>
              Responsible person
            </FieldLabel>
            <AssigneeAutocomplete
              value={field.value}
              label={assignToName || ""}
              onChange={(option) => {
                field.onChange(option?.id ?? "");
                setValue("assignToName", option?.label ?? "", { shouldDirty: true });
              }}
              invalid={Boolean(fieldState.error)}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Assign the team member who will own and manage this business.
            </p>
            {fieldState.error && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {fieldState.error.message}
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
}