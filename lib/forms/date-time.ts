export function toDateTimeLocalValue(value?: string | Date): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function validateEditedDateTime(value: string, original?: string): true | string {
  if (value && value === toDateTimeLocalValue(original) && fromDateTimeLocalValue(value)) return true;
  return validateFutureDateTime(value);
}

export function fromDateTimeLocalValue(value: string): string | undefined {
  if (!value) return undefined;
  const normalized =
    value.includes(" ") && !value.includes("T")
      ? value.replace(" ", "T")
      : value;
  // If date-only (e.g. YYYY-MM-DD without time), do not parse as 12:00 AM UTC
  if (!normalized.includes("T") || !normalized.split("T")[1]?.trim()) {
    return undefined;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(normalized);
  if (!match) return undefined;
  const [, year, month, day, hour, minute] = match.map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  // Reject impossible dates and DST gaps instead of silently rolling them over.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute) return undefined;
  return date.toISOString();
}

export function getCurrentDateLocalValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentDateTimeLocalValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function validateFutureDateTime(value: string): true | string {
  if (!value) return "Enter a valid date and time.";
  const normalized =
    value.includes(" ") && !value.includes("T")
      ? value.replace(" ", "T")
      : value;
  if (!normalized.includes("T")) return "Enter a valid date and time.";
  const parsed = fromDateTimeLocalValue(normalized);
  if (!parsed) return "Enter a valid date and time.";
  const selectedDate = new Date(parsed);
  const threshold = new Date(Date.now() - 60_000);
  if (selectedDate < threshold) {
    return "Follow-up date and time cannot be in the past.";
  }
  return true;
}

export function validateFutureDate(value: string): true | string {
  if (!value) return "Next follow-up date is required.";
  if (value < getCurrentDateLocalValue()) {
    return "Next follow-up date cannot be in the past.";
  }
  return true;
}
