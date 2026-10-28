"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldLabel from "@/components/businesses/FieldLabel";
import { isValidHttpUrl } from "@/lib/business/url-validation";
import type { BusinessFormValues } from "@/lib/business/form-types";

export default function AdditionalInfoSection({
  idPrefix = "",
}: {
  idPrefix?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<BusinessFormValues>();

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
          <p role="alert" className="mt-1 text-xs text-bad">
            {errors.website.message}
          </p>
        )}
      </div>

      <div>
        <FieldLabel htmlFor={`${idPrefix}leadSource`} optional>Lead source</FieldLabel>
        <Input
          id={`${idPrefix}leadSource`}
          list={`${idPrefix}leadSource-options`}
          placeholder="e.g. WhatsApp, Referral, Walk-in"
          autoComplete="off"
          {...register("leadSource")}
        />
        <datalist id={`${idPrefix}leadSource-options`}>
          {["WhatsApp", "Referral", "Walk-in", "Website", "Cold call", "Social media"].map((option) => <option key={option} value={option} />)}
        </datalist>
      </div>

      <div>
        <FieldLabel htmlFor={`${idPrefix}description`}>Description</FieldLabel>
        <Textarea
          id={`${idPrefix}description`}
          placeholder="Enter business description..."
          {...register("description")}
        />
      </div>
    </div>
  );
}
