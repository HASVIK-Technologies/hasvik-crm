/**
 * Leads are either businesses (B2B) or individuals (B2C). The backend has no separate flag: a lead is an individual when
 * its category is the one named "individual" (the business-categories endpoint returns it for B2C leads).
 */
export const INDIVIDUAL_CATEGORY_NAME = "individual";

export type LeadKind = "individual" | "business" | "unknown";

/** True when the category name is "individual", ignoring case and stray spaces. */
export function isIndividualCategory(categoryName?: string | null): boolean {
  return typeof categoryName === "string" && categoryName.trim().toLowerCase() === INDIVIDUAL_CATEGORY_NAME;
}

/** "unknown" while no category is chosen yet (or the lead has none), so screens can use neutral wording. */
export function getLeadKind(categoryName?: string | null): LeadKind {
  const name = typeof categoryName === "string" ? categoryName.trim() : "";
  if (!name || name.toLowerCase() === "uncategorized") return "unknown";
  return isIndividualCategory(name) ? "individual" : "business";
}

/** The label for the lead's name field: a person has a full name, a company a business name. */
export function getLeadNameLabel(kind: LeadKind): string {
  if (kind === "individual") return "Full Name";
  if (kind === "business") return "Business Name";
  return "Name";
}

/** The saved-field names that only businesses have. Individuals never show, send or see history for them. */
export const BUSINESS_PROFILE_FIELDS = ["website", "description"] as const;

/** Website and description are for businesses only; individuals never show or send them. */
export function hasBusinessProfileFields(categoryName?: string | null): boolean {
  return !isIndividualCategory(categoryName);
}
