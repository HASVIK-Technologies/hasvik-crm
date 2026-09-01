import { Input } from "@/components/ui/input";
import FieldLabel from "@/components/businesses/FieldLabel";
import LabeledSelect from "@/components/businesses/LabeledSelect";
import {
  LEAD_SOURCE_OPTIONS,
  REMINDER_OPTIONS,
  TEAM_MEMBER_OPTIONS,
} from "@/lib/business-form-options";
import type {
  BusinessFormState,
  UpdateFormField,
} from "@/lib/business-form-types";

export default function FollowUpSection({
  form,
  update,
  idPrefix = "",
}: {
  form: BusinessFormState;
  update: UpdateFormField;
  idPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      <LabeledSelect
        label="Lead Source"
        placeholder="Select lead source"
        options={LEAD_SOURCE_OPTIONS}
        value={form.leadSource}
        onChange={(v) => update("leadSource", v)}
      />

      <LabeledSelect
        label="Assign To"
        placeholder="Select team member"
        options={TEAM_MEMBER_OPTIONS}
        value={form.assignTo}
        onChange={(v) => update("assignTo", v)}
      />

      <div>
        <FieldLabel htmlFor={`${idPrefix}nextFollowupDate`}>
          Next Follow-up Date
        </FieldLabel>
        <Input
          id={`${idPrefix}nextFollowupDate`}
          type="date"
          value={form.nextFollowupDate}
          onChange={(e) => update("nextFollowupDate", e.target.value)}
        />
      </div>

      <LabeledSelect
        label="Reminder"
        placeholder="Select reminder"
        options={REMINDER_OPTIONS}
        value={form.reminder}
        onChange={(v) => update("reminder", v)}
      />
    </div>
  );
}
