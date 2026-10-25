import type { AuditLogItem } from "@/types/audit-log";

const fieldLabels: Record<string, string> = {
  name: "Name", description: "Description", categoryId: "Category", category: "Category",
  businessType: "Business type", status: "Lead status", phoneNumbers: "Phone numbers",
  whatsappNumbers: "WhatsApp numbers", email: "Email", website: "Website",
  address: "Address", city: "City", state: "State", pincode: "PIN code",
  location: "Location", assignedTo: "Assigned to", leadSource: "Lead source", isActive: "Active",
  fullName: "Full name", firstName: "First name", lastName: "Last name", role: "Role", phoneNumber: "Phone number",
  type: "Type", scheduledAt: "Scheduled for", completedAt: "Completed at", reminderInMinutes: "Reminder (minutes)",
  notes: "Notes", content: "Note", startDate: "Start date", endDate: "End date", expiresAt: "Expires at",
  autoRenew: "Auto-renew", billingCycle: "Billing cycle", price: "Price", amount: "Amount", currency: "Currency",
  planId: "Plan", plan: "Plan", maxUsers: "User limit", maxBusinesses: "Business limit",
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(", ") : "Not set";
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    const label = item.fullName ?? item.name ?? item.email ?? item.number ?? item.url;
    if (label !== undefined) return `${formatValue(label)}${item.isPrimary === true ? " (primary)" : ""}`;
    return "Details unavailable";
  }
  return String(value).replace(/^[A-Z][A-Z_]+$/, (text) => text.toLowerCase().replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase()));
}

export function getSavedFields(log: AuditLogItem) {
  const changes = log.changes ?? {};
  const rawSnapshot = changes.newData ?? changes.after ?? changes.newValue;
  const snapshot = rawSnapshot && typeof rawSnapshot === "object" && !Array.isArray(rawSnapshot)
    ? rawSnapshot as Record<string, unknown>
    : changes;
  const fields = Array.isArray(changes.changedFields)
    ? changes.changedFields.filter((field): field is string => typeof field === "string")
    : Object.keys(snapshot);
  return [...new Set(fields)].filter((field) => field in fieldLabels).map((field) => ({
    field, label: fieldLabels[field],
    value: Object.hasOwn(snapshot, field) ? formatValue(savedValue(snapshot[field])) : "Value unavailable",
  }));
}

function savedValue(value: unknown): unknown {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const change = value as Record<string, unknown>;
    if (Object.hasOwn(change, "newValue")) return change.newValue;
    if (Object.hasOwn(change, "after")) return change.after;
  }
  return value;
}
