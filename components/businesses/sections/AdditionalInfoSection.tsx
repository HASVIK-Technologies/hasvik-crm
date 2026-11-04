"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldLabel from "@/components/businesses/FieldLabel";
import { isValidHttpUrl } from "@/lib/business/url-validation";
import { hasBusinessProfileFields } from "@/lib/business/lead-type";
import type { BusinessFormValues } from "@/lib/business/form-types";

export default function AdditionalInfoSection({
  idPrefix = "",
}: {
  idPrefix?: string;
}) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<BusinessFormValues>();
  const categoryName = useWatch({ control, name: "categoryName" });

  // Individuals (B2C leads) have no website or business description.
  if (!hasBusinessProfileFields(categoryName)) return null;

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-3">
      <div>
        <FieldLabel htmlFor={`${idPrefix}website`}>Website</FieldLabel>
        <Input
          id={`${idPrefix}website`}
          placeholder="https://www.example.com"
          aria-invalid={Boolean(errors.website)}
          {...register("website", {
            validate: (value) =>
              isValidHttpUrl(value) ||
              "Enter a valid website address (for example, www.example.com).",
          })}
        />
        {errors.website && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.website.message}
          </p>
        )}
      </div>

      <div>
        <FieldLabel htmlFor={`${idPrefix}description`}>Description</FieldLabel>
        <Textarea
          id={`${idPrefix}description`}
          placeholder="Enter a short description..."
          {...register("description")}
        />
      </div>
    </div>
  );
}
