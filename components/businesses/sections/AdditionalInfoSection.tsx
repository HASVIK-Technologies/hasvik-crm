"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldLabel from "@/components/businesses/FieldLabel";
import SelectField from "@/components/common/SelectField";
import { isValidHttpUrl } from "@/lib/business/url-validation";
import type { BusinessFormValues } from "@/lib/business/form-types";

/** Where leads usually come from. The API stores free text, so a value outside this list is kept as it is. */
const LEAD_SOURCES = ["WhatsApp", "Referral", "Walk-in", "Website", "Cold call", "Social media"];

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

      <Controller
        control={control}
        name="leadSource"
        render={({ field }) => {
          const known = LEAD_SOURCES.includes(field.value) || !field.value;
          return (
            <div>
              <FieldLabel htmlFor={`${idPrefix}leadSource`}>Lead source</FieldLabel>
              <SelectField
                id={`${idPrefix}leadSource`}
                value={field.value}
                onChange={field.onChange}
                placeholder="Where did this lead come from?"
                options={[{ value: "", label: "Not sure" }, ...(known ? [] : [{ value: field.value, label: field.value }]), ...LEAD_SOURCES.map((source) => ({ value: source, label: source }))]}
              />
            </div>
          );
        }}
      />

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
