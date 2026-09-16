"use client";

import {
  Controller,
  useFormContext,
  useWatch,
  type UseFieldArrayReturn,
} from "react-hook-form";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import MobileInput from "@/components/common/MobileInput";
import FieldLabel from "@/components/businesses/FieldLabel";
import NumberListField from "@/components/businesses/NumberListField";
import { cn } from "@/lib/utils";
import type { BusinessFormValues } from "@/lib/business-form-types";

export default function ContactInfoSection({
  idPrefix = "",
  phoneArray,
  whatsappArray,
}: {
  idPrefix?: string;
  phoneArray: UseFieldArrayReturn<BusinessFormValues, "phoneNumbers", "id">;
  whatsappArray: UseFieldArrayReturn<
    BusinessFormValues,
    "whatsappNumbers",
    "id"
  >;
}) {
  const {
    control,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<BusinessFormValues>();

  const watchedPhoneNumbers = useWatch({ control, name: "phoneNumbers" });
  const watchedWhatsappNumbers = useWatch({ control, name: "whatsappNumbers" });

  const validatePhoneRequired = () => {
    const values = getValues("phoneNumbers");
    return (
      values.some((v) => v.value.trim().length > 0) ||
      "At least one phone number is required"
    );
  };

  const validateWhatsappRequired = () => {
    const values = getValues("whatsappNumbers");
    return (
      values.some((v) => v.value.trim().length > 0) ||
      "At least one WhatsApp number is required"
    );
  };

  // Clicking the WhatsApp icon on a phone row copies that specific number
  // into the WhatsApp Numbers list (or removes it, if it's already there) -
  // rather than syncing the whole list, since not every phone number is
  // necessarily also a WhatsApp number.
  const toggleMarkAsWhatsapp = (index: number) => {
    const phoneValue = getValues(`phoneNumbers.${index}.value`).trim();
    if (!phoneValue) return;

    const currentWhatsapp = getValues("whatsappNumbers");
    const matchIndex = currentWhatsapp.findIndex(
      (entry) => entry.value === phoneValue,
    );

    if (matchIndex >= 0) {
      // Already marked - unmark it. A field array always needs at least
      // one row, so if this is the only one, clear its value instead of
      // removing the row entirely.
      if (currentWhatsapp.length === 1) {
        setValue("whatsappNumbers.0.value", "", { shouldValidate: true });
      } else {
        whatsappArray.remove(matchIndex);
      }
      return;
    }

    // Not marked yet - reuse the first empty WhatsApp row if one exists,
    // instead of always adding a new row (avoids leaving a blank row
    // sitting above the one that was just filled).
    const emptyIndex = currentWhatsapp.findIndex(
      (entry) => entry.value.trim().length === 0,
    );

    if (emptyIndex >= 0) {
      setValue(`whatsappNumbers.${emptyIndex}.value`, phoneValue, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      whatsappArray.append({ value: phoneValue });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-[#e5edf1] bg-white p-4">
        <NumberListField
          label="Phone Numbers"
          addLabel="Add Phone Number"
          addIcon={Plus}
          required
          rowKeys={phoneArray.fields.map((f) => f.id)}
          onAdd={() => phoneArray.append({ value: "" })}
          onRemove={(index) => {
            if (phoneArray.fields.length === 1) return;
            phoneArray.remove(index);
          }}
          renderRow={(index) => (
            <Controller
              control={control}
              name={`phoneNumbers.${index}.value` as const}
              rules={{ validate: validatePhoneRequired }}
              render={({ field, fieldState }) => (
                <MobileInput
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!fieldState.error}
                />
              )}
            />
          )}
          renderRowActions={(index) => {
            const phoneValue = watchedPhoneNumbers?.[index]?.value ?? "";
            const isMarked =
              phoneValue.trim().length > 0 &&
              (watchedWhatsappNumbers ?? []).some(
                (entry) => entry.value === phoneValue,
              );
            return (
              <button
                type="button"
                aria-label={
                  isMarked
                    ? "Remove from WhatsApp Numbers"
                    : "Mark as WhatsApp number"
                }
                onClick={() => toggleMarkAsWhatsapp(index)}
                disabled={!phoneValue.trim()}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isMarked
                    ? "bg-[#e7f5f0] text-[#08765d] hover:bg-[#d8efe6]"
                    : "bg-[#f3f5f6] text-[#8a9eaa] hover:bg-[#e5edf1] hover:text-[#547080]",
                  !phoneValue.trim() && "cursor-not-allowed opacity-50",
                )}
              >
                <WhatsAppIcon className="size-4" />
              </button>
            );
          }}
        />
      </div>

      <div className="rounded-xl border border-[#e5edf1] bg-white p-4">
        <NumberListField
          label="WhatsApp Numbers"
          addLabel="Add WhatsApp Number"
          addIcon={WhatsAppIcon}
          required
          rowKeys={whatsappArray.fields.map((f) => f.id)}
          onAdd={() => whatsappArray.append({ value: "" })}
          onRemove={(index) => {
            if (whatsappArray.fields.length === 1) return;
            whatsappArray.remove(index);
          }}
          renderRow={(index) => (
            <Controller
              control={control}
              name={`whatsappNumbers.${index}.value` as const}
              rules={{ validate: validateWhatsappRequired }}
              render={({ field, fieldState }) => (
                <MobileInput
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!fieldState.error}
                />
              )}
            />
          )}
        />
      </div>

      <div className="rounded-xl border border-[#e5edf1] bg-white p-4">
        <FieldLabel htmlFor={`${idPrefix}email`} optional>
          Email
        </FieldLabel>
        <Input
          id={`${idPrefix}email`}
          type="email"
          placeholder="example@email.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <p className="mt-1.5 text-xs text-[#8a9eaa]">Business email address</p>
      </div>
    </div>
  );
}
