export type NumberFieldValue = {
  value: string;
};

export type BusinessFormValues = {
  businessName: string;
  category: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  status: string;
  businessType: string;
  phoneNumbers: NumberFieldValue[];
  whatsappNumbers: NumberFieldValue[];
  email: string;
  website: string;
  description: string;
  notes: string;
  leadSource: string;
  assignTo: string;
  nextFollowupDate: string;
  reminder: string;
};

export const defaultBusinessFormValues: BusinessFormValues = {
  businessName: "",
  category: "",
  city: "",
  state: "",
  pincode: "",
  address: "",
  status: "",
  businessType: "",
  phoneNumbers: [{ value: "" }],
  whatsappNumbers: [{ value: "" }],
  email: "",
  website: "",
  description: "",
  notes: "",
  leadSource: "",
  assignTo: "",
  nextFollowupDate: "",
  reminder: "",
};

// Field names validated per step of the mobile wizard. Phone/WhatsApp
// numbers are validated separately (their paths depend on how many rows
// currently exist), since they're field arrays rather than single fields.
export const STEP_FIELD_NAMES = {
  business: [
    "businessName",
    "category",
    "city",
    "state",
    "pincode",
    "address",
    "status",
  ] as const,
  additional: ["website", "description", "notes"] as const,
  followup: ["leadSource", "assignTo", "nextFollowupDate", "reminder"] as const,
};
