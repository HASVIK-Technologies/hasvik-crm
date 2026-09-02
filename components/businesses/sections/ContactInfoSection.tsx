import { MessageCircle, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import FieldLabel from "@/components/businesses/FieldLabel";
import NumberListField from "@/components/businesses/NumberListField";
import type {
  BusinessFormState,
  UpdateFormField,
} from "@/lib/business-form-types";

export default function ContactInfoSection({
  form,
  update,
  onPhoneNumbersChange,
  onWhatsappNumbersChange,
  onSameAsPhoneToggle,
  idPrefix = "",
}: {
  form: BusinessFormState;
  update: UpdateFormField;
  onPhoneNumbersChange: (values: string[]) => void;
  onWhatsappNumbersChange: (values: string[]) => void;
  onSameAsPhoneToggle: (checked: boolean) => void;
  idPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-[#e5edf1] bg-white p-4">
        <NumberListField
          label="Phone Numbers"
          addLabel="Add Phone Number"
          addIcon={Plus}
          values={form.phoneNumbers}
          onChange={onPhoneNumbersChange}
          required
        />
      </div>

      <div className="rounded-xl border border-[#e5edf1] bg-white p-4">
        <NumberListField
          label="WhatsApp Numbers"
          addLabel="Add WhatsApp Number"
          addIcon={MessageCircle}
          values={form.whatsappNumbers}
          onChange={onWhatsappNumbersChange}
          required
          disabled={form.sameAsPhone}
          headerAction={
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#547080]">
              <Checkbox
                checked={form.sameAsPhone}
                onCheckedChange={(checked) =>
                  onSameAsPhoneToggle(checked === true)
                }
              />
              Same as phone
            </label>
          }
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
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <p className="mt-1.5 text-xs text-[#8a9eaa]">Business email address</p>
      </div>
    </div>
  );
}
