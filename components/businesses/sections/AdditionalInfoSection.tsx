import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldLabel from "@/components/businesses/FieldLabel";
import type {
  BusinessFormState,
  UpdateFormField,
} from "@/lib/business-form-types";

export default function AdditionalInfoSection({
  form,
  update,
  idPrefix = "",
}: {
  form: BusinessFormState;
  update: UpdateFormField;
  idPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-3">
      <div>
        <FieldLabel htmlFor={`${idPrefix}website`}>Website</FieldLabel>
        <Input
          id={`${idPrefix}website`}
          placeholder="https://www.example.com"
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      <div>
        <FieldLabel htmlFor={`${idPrefix}description`}>Description</FieldLabel>
        <Textarea
          id={`${idPrefix}description`}
          placeholder="Enter business description..."
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div>
        <FieldLabel htmlFor={`${idPrefix}notes`}>Notes</FieldLabel>
        <Textarea
          id={`${idPrefix}notes`}
          placeholder="Add any additional notes..."
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>
    </div>
  );
}
