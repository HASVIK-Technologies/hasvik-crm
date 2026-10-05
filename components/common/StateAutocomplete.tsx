"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import FieldLabel from "@/components/businesses/FieldLabel";
import { STATE_OPTIONS } from "@/lib/business/form-options";

interface StateAutocompleteProps {
  value?: string;
  onChange?: (state: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
}

export default function StateAutocomplete({
  value = "",
  onChange,
  id,
  label,
  placeholder = "Start typing a state or union territory",
  required = false,
  invalid = false,
}: StateAutocompleteProps) {
  const query = value.trim().toLowerCase();
  const matchingStates = STATE_OPTIONS.filter((state) =>
    state.toLowerCase().includes(query),
  );

  return (
    <div className="w-full">
      {label && (
        <FieldLabel htmlFor={id} required={required} invalid={invalid}>
          {label}
        </FieldLabel>
      )}
      <Combobox
        items={matchingStates}
        value={value}
        inputValue={value}
        onValueChange={(nextValue) => onChange?.(nextValue ?? "")}
        onInputValueChange={(nextValue) => {
          onChange?.(nextValue.replace(/[^A-Za-z\s]/g, ""));
        }}
      >
        <ComboboxInput
          id={id}
          placeholder={placeholder}
          aria-invalid={invalid}
          className="h-9 w-full"
          showTrigger={!value}
          showClear={Boolean(value)}
          onChange={(event) => {
            onChange?.(
              event.currentTarget.value.replace(/[^A-Za-z\s]/g, ""),
            );
          }}
        />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No matching state or union territory.</ComboboxEmpty>
            {matchingStates.map((state) => (
              <ComboboxItem key={state} value={state}>
                {state}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
