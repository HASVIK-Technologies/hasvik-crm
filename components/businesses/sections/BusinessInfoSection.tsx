"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldLabel from "@/components/businesses/FieldLabel";
import FormCategoryAutocomplete from "@/components/common/form-controls/FormCategoryAutocomplete";
import FormCityAutocomplete from "@/components/common/form-controls/FormCityAutocomplete";
import FormLeadStatusSelect from "@/components/common/form-controls/FormLeadStatusSelect";
import StateAutocomplete from "@/components/common/StateAutocomplete";
import { STATE_OPTIONS } from "@/lib/business-form-options";
import type { BusinessFormValues } from "@/lib/business-form-types";

export default function BusinessInfoSection({
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

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      <div>
        <FieldLabel
          htmlFor={`${idPrefix}businessName`}
          required
          invalid={!!errors.businessName}
        >
          Business Name
        </FieldLabel>
        <Input
          id={`${idPrefix}businessName`}
          placeholder="Enter business name"
          aria-invalid={!!errors.businessName}
          {...register("businessName", {
            required: "Business Name is required",
          })}
        />
      </div>

      <Controller
        control={control}
        name="category"
        rules={{ required: "Category is required" }}
        render={({ field, fieldState }) => (
          <FormCategoryAutocomplete
            id={`${idPrefix}category`}
            label="Category"
            value={field.value}
            valueLabel={categoryName}
            onChange={(categoryId) => field.onChange(categoryId)}
            placeholder="Select a category"
            required
            invalid={!!fieldState.error}
          />
        )}
      />

      <Controller
        control={control}
        name="city"
        rules={{ required: "City is required" }}
        render={({ field, fieldState }) => (
          <FormCityAutocomplete
            id={`${idPrefix}city`}
            label="City"
            value={field.value}
            onChange={field.onChange}
            placeholder="Select a city"
            required
            invalid={!!fieldState.error}
          />
        )}
      />

      <div>
        <FieldLabel
          htmlFor={`${idPrefix}address`}
          required
          invalid={!!errors.address}
        >
          Address
        </FieldLabel>
        <Textarea
          id={`${idPrefix}address`}
          placeholder="Enter complete address"
          rows={1}
          aria-invalid={!!errors.address}
          {...register("address", { required: "Address is required" })}
        />
      </div>

      <div>
        <FieldLabel
          htmlFor={`${idPrefix}pincode`}
          required
          invalid={!!errors.pincode}
        >
          Pincode
        </FieldLabel>
        <Input
          id={`${idPrefix}pincode`}
          placeholder="Enter pincode"
          inputMode="numeric"
          maxLength={6}
          aria-invalid={!!errors.pincode}
          {...register("pincode", {
            required: "Pincode is required",
            pattern: {
              value: /^\d{6}$/,
              message: "Enter a valid 6-digit pincode",
            },
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
            },
          })}
        />
      </div>

      <Controller
        control={control}
        name="state"
        rules={{
          required: "State is required",
          validate: (value) =>
            STATE_OPTIONS.some((state) => state === value.trim()) ||
            "Select a valid Indian state or union territory",
        }}
        render={({ field, fieldState }) => (
          <StateAutocomplete
            id={`${idPrefix}state`}
            label="State"
            value={field.value}
            onChange={field.onChange}
            required
            invalid={!!fieldState.error}
          />
        )}
      />

      <Controller
        control={control}
        name="status"
        rules={{ required: "Status is required" }}
        render={({ field, fieldState }) => (
          <FormLeadStatusSelect
            id={`${idPrefix}status`}
            label="Status"
            value={field.value}
            onChange={field.onChange}
            required
            invalid={!!fieldState.error}
          />
        )}
      />

      <div>
        <FieldLabel htmlFor={`${idPrefix}locationUrl`}>Location URL</FieldLabel>
        <Input
          id={`${idPrefix}locationUrl`}
          type="url"
          placeholder="https://maps.google.com/..."
          {...register("locationUrl")}
        />
      </div>
    </div>
  );
}
