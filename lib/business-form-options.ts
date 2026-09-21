export const CATEGORY_OPTIONS = [
  "Restaurant & Cafe",
  "Retail & Shopping",
  "Healthcare",
  "Education",
  "Real Estate",
  "Automobile",
  "Beauty & Wellness",
  "Professional Services",
  "Manufacturing",
  "Other",
];

export const CITY_OPTIONS = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Indore",
  "Surat",
];

export const STATE_OPTIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

// Values match the backend's exact enum for `status` on POST/PATCH
// /businesses - sending anything else is rejected with a 400. Labels are
// just the friendly text shown in the dropdown.
export const STATUS_OPTIONS = [
  { value: "NEW", label: "New Lead" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "PROPOSAL_AND_NEGOTIATION", label: "Proposal & Negotiation" },
  { value: "INTERESTED", label: "Interested" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

export const BUSINESS_TYPE_OPTIONS = [
  "Proprietorship",
  "Partnership",
  "Private Limited",
  "LLP",
  "Franchise",
];

export const LEAD_SOURCE_OPTIONS = [
  "Referral",
  "Cold Call",
  "Walk-in",
  "Website",
  "Social Media",
  "Advertisement",
  "Trade Show",
];

export const TEAM_MEMBER_OPTIONS = [
  "Amit Sharma",
  "Priya Nair",
  "Rahul Verma",
  "Sneha Iyer",
];

export const REMINDER_OPTIONS = [
  "No reminder",
  "On the day",
  "1 day before",
  "2 days before",
  "1 week before",
];
