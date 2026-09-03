export type BusinessFormState = {
  businessName: string;
  category: string;
  city: string;
  address: string;
  status: string;
  businessType: string;
  phoneNumbers: string[];
  whatsappNumbers: string[];
  sameAsPhone: boolean;
  email: string;
  website: string;
  description: string;
  notes: string;
  leadSource: string;
  assignTo: string;
  nextFollowupDate: string;
  reminder: string;
  addAnother: boolean;
};

export const initialBusinessFormState: BusinessFormState = {
  businessName: "",
  category: "",
  city: "",
  address: "",
  status: "",
  businessType: "",
  phoneNumbers: [""],
  whatsappNumbers: [""],
  sameAsPhone: false,
  email: "",
  website: "",
  description: "",
  notes: "",
  leadSource: "",
  assignTo: "",
  nextFollowupDate: "",
  reminder: "",
  addAnother: false,
};

export type UpdateFormField = <K extends keyof BusinessFormState>(
  key: K,
  value: BusinessFormState[K],
) => void;
