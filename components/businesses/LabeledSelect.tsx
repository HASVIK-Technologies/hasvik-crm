import FieldLabel from "@/components/businesses/FieldLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectOption = string | { value: string; label: string };

function normalizeOption(option: SelectOption): {
  value: string;
  label: string;
} {
  return typeof option === "string" ? { value: option, label: option } : option;
}

export default function LabeledSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  required = false,
  optional = false,
  invalid = false,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  optional?: boolean;
  invalid?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <FieldLabel required={required} optional={optional}>
        {label}
      </FieldLabel>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full" aria-invalid={invalid}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(normalizeOption).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
