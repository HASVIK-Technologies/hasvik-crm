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
import type {
  BusinessFormState,
  UpdateFormField,
} from "@/lib/business-form-types";

export default function BusinessInfoSection({
  form,
  update,
  idPrefix = "",
}: {
  form: BusinessFormState;
  update: UpdateFormField;
  idPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      <div>
        <FieldLabel htmlFor={`${idPrefix}businessName`} required>
          Business Name
        </FieldLabel>
        <Input
          id={`${idPrefix}businessName`}
          placeholder="Enter business name"
          value={form.businessName}
          onChange={(e) => update("businessName", e.target.value)}
          required
        />
      </div>

      <LabeledSelect
        label="Category"
        placeholder="Select category"
        options={CATEGORY_OPTIONS}
        value={form.category}
        onChange={(v) => update("category", v)}
        required
      />

      <LabeledSelect
        label="City"
        placeholder="Select city"
        options={CITY_OPTIONS}
        value={form.city}
        onChange={(v) => update("city", v)}
        required
      />

      <div>
        <FieldLabel htmlFor={`${idPrefix}address`} required>
          Address
        </FieldLabel>
        <Textarea
          id={`${idPrefix}address`}
          placeholder="Enter complete address"
          rows={1}
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          required
        />
      </div>

      <LabeledSelect
        label="Status"
        placeholder="Select status"
        options={STATUS_OPTIONS}
        value={form.status}
        onChange={(v) => update("status", v)}
        required
      />

      <LabeledSelect
        label="Business Type"
        placeholder="Select business type"
        options={BUSINESS_TYPE_OPTIONS}
        value={form.businessType}
        onChange={(v) => update("businessType", v)}
        optional
      />
    </div>
  );
}
