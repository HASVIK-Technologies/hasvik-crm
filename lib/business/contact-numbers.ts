export interface ContactNumber {
  number?: string;
  name?: string;
  type?: string;
  isPrimary?: boolean;
}

export interface NormalizedContactNumber extends ContactNumber {
  number: string;
  digits: string;
}

export function canonicalDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

export function normalizeNumbers(
  values?: Array<ContactNumber | string>,
  fallback?: string,
): NormalizedContactNumber[] {
  const seen = new Set<string>();
  return [...(values ?? []), ...(fallback ? [fallback] : [])].flatMap((value) => {
    const entry = typeof value === "string" ? { number: value } : value;
    const number = String(entry.number ?? "").trim();
    const digits = number.replace(/\D/g, "");
    if (!digits) return [];
    const canonical = canonicalDigits(digits);
    if (seen.has(canonical)) return [];
    seen.add(canonical);
    return [{ ...entry, number, digits }];
  });
}

export function labelFor(entry: ContactNumber, index: number): string {
  const descriptor = entry.name || entry.type;
  if (entry.isPrimary) {
    return descriptor ? `${descriptor} (Primary)` : "Primary";
  }
  return descriptor || `Number ${index + 1}`;
}

export function getWhatsAppUrl(digits: string): string {
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}
