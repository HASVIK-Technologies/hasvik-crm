"use client";

import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CircleCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldLabel from "@/components/businesses/FieldLabel";
import FormCategoryAutocomplete from "@/components/common/form-controls/FormCategoryAutocomplete";
import FormCityAutocomplete from "@/components/common/form-controls/FormCityAutocomplete";
import FormLeadStatusSelect from "@/components/common/form-controls/FormLeadStatusSelect";
import StateAutocomplete from "@/components/common/StateAutocomplete";
import { STATE_OPTIONS } from "@/lib/business/form-options";
import { isValidHttpUrl } from "@/lib/business/url-validation";
import type { BusinessFormValues } from "@/lib/business/form-types";
import { usePincodeLookup } from "@/hooks/use-location";

/**
 * Order: who it is (name, category, stage), where it is (address, pincode, city, state), then the map link.
 * Required fields are marked with * (see FieldLabel).
 */
export default function BusinessInfoSection({
  idPrefix = "",
}: {
  idPrefix?: string;
}) {
  const {
    control,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<BusinessFormValues>();

  const categoryName = useWatch({ control, name: "categoryName" });
  const pincode = useWatch({ control, name: "pincode" });
  const state = useWatch({ control, name: "state" });
  const lookup = usePincodeLookup(pincode?.trim() ?? "");
  const found = lookup.data;

  // A known pincode fills in an empty city and state; anything the user already typed is left alone.
  useEffect(() => {
    if (!found) return;
    const options = { shouldDirty: true, shouldValidate: true } as const;
    if (!getValues("state").trim() && found.state) setValue("state", found.state, options);
    if (!getValues("city").trim() && found.district) setValue("city", found.district, options);
  }, [found, getValues, setValue]);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <FieldLabel htmlFor={`${idPrefix}businessName`} required invalid={!!errors.businessName}>
          Business name
        </FieldLabel>
        <Input
          id={`${idPrefix}businessName`}
          placeholder="Enter business name"
          autoComplete="organization"
          aria-invalid={!!errors.businessName}
          {...register("businessName", { required: "Business name is required" })}
        />
      </div>

      <div className="lg:col-span-2">
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
      </div>

      <div className="sm:col-span-2 lg:col-span-2">
        <Controller
          control={control}
          name="status"
          rules={{ required: "Stage is required" }}
          render={({ field, fieldState }) => (
            <FormLeadStatusSelect
              id={`${idPrefix}status`}
              label="Stage"
              value={field.value}
              onChange={field.onChange}
              required
              invalid={!!fieldState.error}
            />
          )}
        />
      </div>

      <div className="sm:col-span-2 lg:col-span-6">
        <FieldLabel htmlFor={`${idPrefix}address`} required invalid={!!errors.address}>
          Address
        </FieldLabel>
        <Textarea
          id={`${idPrefix}address`}
          placeholder="Enter complete address"
          rows={2}
          autoComplete="street-address"
          aria-invalid={!!errors.address}
          {...register("address", { required: "Address is required" })}
        />
      </div>

      <div className="lg:col-span-2">
        <FieldLabel htmlFor={`${idPrefix}pincode`} required invalid={!!errors.pincode}>
          Pincode
        </FieldLabel>
        <Input
          id={`${idPrefix}pincode`}
          placeholder="6 digits"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          aria-invalid={!!errors.pincode}
          {...register("pincode", {
            required: "Pincode is required",
            pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit pincode" },
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
            },
          })}
        />
        <p aria-live="polite" className="mt-1.5 min-h-5 text-sm">
          {errors.pincode ? (
            <span role="alert" className="text-bad">{errors.pincode.message}</span>
          ) : lookup.isFetching ? (
            <span className="inline-flex items-center gap-1.5 text-muted"><Loader2 className="size-3.5 animate-spin" aria-hidden />Looking up this pincode…</span>
          ) : found ? (
            <span className="inline-flex items-center gap-1.5 text-ok"><CircleCheck className="size-4" aria-hidden />{[found.district, found.state].filter(Boolean).join(", ")}</span>
          ) : lookup.isError ? (
            <span className="text-muted">Pincode lookup is unavailable. Fill in the city and state yourself.</span>
          ) : lookup.isSuccess ? (
            <span className="text-warn">We couldn&apos;t find this pincode. Check it, or fill in the city and state yourself.</span>
          ) : (
            <span className="text-muted">Enter it first and we&apos;ll fill in the city and state.</span>
          )}
        </p>
      </div>

      <div className="lg:col-span-2">
        <Controller
          control={control}
          name="city"
          rules={{ required: "City is required" }}
          render={({ field, fieldState }) => (
            <FormCityAutocomplete
              id={`${idPrefix}city`}
              label="City"
              state={state}
              suggestions={found ? [found.district, ...found.areas] : []}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select a city"
              required
              invalid={!!fieldState.error}
            />
          )}
        />
      </div>

      <div className="lg:col-span-2">
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
      </div>

      <div className="sm:col-span-2 lg:col-span-6">
        <FieldLabel htmlFor={`${idPrefix}locationUrl`} optional>Location link</FieldLabel>
        <Input
          id={`${idPrefix}locationUrl`}
          type="url"
          placeholder="https://maps.google.com/..."
          aria-invalid={Boolean(errors.locationUrl)}
          {...register("locationUrl", {
            validate: (value) => isValidHttpUrl(value) || "Enter a valid location link.",
          })}
        />
        {errors.locationUrl && (
          <p role="alert" className="mt-1 text-sm text-bad">
            {errors.locationUrl.message}
          </p>
        )}
      </div>
    </div>
  );
}
