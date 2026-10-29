"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import TypeaheadField, { type TypeaheadOption } from "@/components/common/TypeaheadField";
import { useCityAutocomplete } from "@/hooks/use-filter-options";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useStateCities } from "@/hooks/use-location";
import { fold } from "@/lib/location/normalise";

interface FormCityAutocompleteProps {
  id?: string;
  label: string;
  value?: string;
  onChange: (city: string) => void;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  /** Selected state: its full city list is offered (from a free public directory). */
  state?: string;
  /** Places found from the pincode, shown first. */
  suggestions?: string[];
}

/**
 * City: suggestions from the pincode first, then cities already used in the CRM, then every city in the chosen
 * state. Anything else can still be typed in.
 */
export default function FormCityAutocomplete({
  id,
  label,
  value = "",
  onChange,
  placeholder = "Select a city",
  required,
  invalid,
  state = "",
  suggestions = [],
}: FormCityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim());
  const used = useCityAutocomplete(debounced, open);
  const stateCities = useStateCities(state, open || Boolean(state));

  const options = useMemo(() => {
    const seen = new Set<string>();
    const list: TypeaheadOption[] = [];
    const add = (city: string, hint: string) => {
      const key = fold(city);
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push({ value: city, label: city, hint });
    };
    suggestions.forEach((city) => add(city, "From this pincode"));
    (used.data ?? []).forEach((item) => add(item.city, "Already in your CRM"));
    (stateCities.data ?? []).forEach((city) => add(city, state));
    return list;
  }, [suggestions, used.data, stateCities.data, state]);

  return (
    <TypeaheadField
      id={id}
      label={label}
      ariaLabel="City"
      icon={MapPin}
      placeholder={placeholder}
      options={options}
      value={value}
      onChange={(next) => onChange(next)}
      onQueryChange={setSearch}
      onOpenChange={setOpen}
      loading={open && (used.isFetching || stateCities.isFetching) && options.length === 0}
      allowCustom
      emptyText={state ? "No matching city. Type the name to use it." : "Choose a state to see its cities, or type the name."}
      required={required}
      invalid={invalid}
    />
  );
}
