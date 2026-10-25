type SavedField = { field: string; label: string; value: string };

export function getActivityMessages(action: string, fields: SavedField[], entityLabel = "Business"): string[] {
  if (!["UPDATE", "ASSIGN", "STATUS_CHANGE"].includes(action)) return [];
  return fields.map(({ field, label, value }) => {
    if (value === "Value unavailable" || value === "Details unavailable") return `${label} updated`;
    const cleared = value === "Not set";
    if (field === "isActive") {
      return value === "Yes" ? `${entityLabel} activated` : value === "No" ? `${entityLabel} deactivated` : `${entityLabel} activation updated`;
    }
    if (field === "assignedTo") {
      if (cleared) return `${entityLabel} unassigned`;
      return /^[a-f\d]{24}$/i.test(value) ? `${entityLabel} assignment updated` : `Assigned to ${value}`;
    }
    if (field === "name") return cleared ? `${entityLabel} name cleared` : `${entityLabel} name changed to ${value}`;
    if (field === "status") {
      const statusLabel = entityLabel === "Business" ? "Lead status" : `${entityLabel} status`;
      return cleared ? `${statusLabel} cleared` : `${statusLabel} changed to ${value}`;
    }
    if (field === "categoryId" || field === "category") {
      return cleared ? "Category cleared" : /^[a-f\d]{24}$/i.test(value) ? "Category changed" : `Category changed to ${value}`;
    }
    if (cleared) return `${label} cleared`;
    if (["description", "location", "phoneNumbers", "whatsappNumbers", "address", "website"].includes(field)) {
      return `${label} updated`;
    }
    return `${label} changed to ${value}`;
  });
}
