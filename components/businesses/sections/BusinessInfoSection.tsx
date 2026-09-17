"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldLabel from "@/components/businesses/FieldLabel";
import LabeledSelect from "@/components/businesses/LabeledSelect";
import {
  BUSINESS_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  CITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/business-form-options";
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
          <LabeledSelect
            label="Category"
            placeholder="Select category"
            options={CATEGORY_OPTIONS}
            value={field.value}
            onChange={field.onChange}
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
          <LabeledSelect
            label="City"
            placeholder="Select city"
            options={CITY_OPTIONS}
            value={field.value}
            onChange={field.onChange}
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

      <div>
        <FieldLabel
          htmlFor={`${idPrefix}state`}
          required
          invalid={!!errors.state}
        >
          State
        </FieldLabel>
        <Input
          id={`${idPrefix}state`}
          placeholder="Enter state"
          aria-invalid={!!errors.state}
          {...register("state", { required: "State is required" })}
        />
      </div>

      <Controller
        control={control}
        name="status"
        rules={{ required: "Status is required" }}
        render={({ field, fieldState }) => (
          <LabeledSelect
            label="Status"
            placeholder="Select status"
            options={STATUS_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            required
            invalid={!!fieldState.error}
          />
        )}
      />

      <Controller
        control={control}
        name="businessType"
        render={({ field }) => (
          <LabeledSelect
            label="Business Type"
            placeholder="Select business type"
            options={BUSINESS_TYPE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            optional
          />
        )}
      />
    </div>
  );
}
