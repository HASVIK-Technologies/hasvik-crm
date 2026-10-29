import FieldLabel from "@/components/businesses/FieldLabel";
import TypeaheadField from "@/components/common/TypeaheadField";

export type SelectOption = string | { value: string; label: string };

function normalizeOption(option: SelectOption): { value: string; label: string } {
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
      <TypeaheadField
        ariaLabel={label}
        placeholder={placeholder}
        options={options.map(normalizeOption)}
        value={value}
        onChange={(next) => onChange(next)}
        invalid={invalid}
        disabled={disabled}
      />
    </div>
  );
}
