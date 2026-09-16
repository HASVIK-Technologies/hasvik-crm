"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldLabel from "@/components/businesses/FieldLabel";
import type { BusinessFormValues } from "@/lib/business-form-types";

export default function AdditionalInfoSection({
  idPrefix = "",
}: {
  idPrefix?: string;
}) {
  const { register } = useFormContext<BusinessFormValues>();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-3">
      <div>
        <FieldLabel htmlFor={`${idPrefix}website`}>Website</FieldLabel>
        <Input
          id={`${idPrefix}website`}
          placeholder="https://www.example.com"
          {...register("website")}
        />
      </div>

      <div>
        <FieldLabel htmlFor={`${idPrefix}description`}>Description</FieldLabel>
        <Textarea
          id={`${idPrefix}description`}
          placeholder="Enter business description..."
          {...register("description")}
        />
      </div>

      <div>
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
