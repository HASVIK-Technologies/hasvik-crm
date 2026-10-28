import type { BusinessFormValues } from "./form-types";
import { normalizeHttpUrl } from "./url-validation.ts";

function editableValues(values: BusinessFormValues): Record<string, unknown> {
  return {
    name: values.businessName.trim(),
    categoryId: values.category || null,
    status: values.status,
    email: values.email.trim() || null,
    website: normalizeHttpUrl(values.website) || null,
    address: values.address.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    pincode: values.pincode.trim(),
    description: values.description,
    leadSource: values.leadSource.trim(),
    location: { url: normalizeHttpUrl(values.locationUrl) },
    assignedTo: values.assignTo || null,
    phoneNumbers: values.phoneNumbers.filter((item) => item.value.trim())
      .map((item, index) => ({ number: item.value.trim(), isPrimary: index === 0 })),
    whatsappNumbers: values.whatsappNumbers.filter((item) => item.value.trim())
      .map((item, index) => ({ number: item.value.trim(), isPrimary: index === 0 })),
  };
}

// Compare normalized values against the loaded record, including restored drafts.
// Arrays are replaced as a whole only when their editable values change.
export function toBusinessUpdatePayload(
  values: BusinessFormValues,
  original: BusinessFormValues,
): Record<string, unknown> {
  const baseline = editableValues(original);
  return Object.fromEntries(Object.entries(editableValues(values)).filter(
    ([key, value]) => JSON.stringify(value) !== JSON.stringify(baseline[key]),
  ));
}
