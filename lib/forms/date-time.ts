export function toDateTimeLocalValue(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
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
  if (!value || !value.includes("T")) return "Enter a valid date and time.";
  const parsed = fromDateTimeLocalValue(value);
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
