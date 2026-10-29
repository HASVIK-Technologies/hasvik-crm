import { STATE_OPTIONS } from "@/lib/business/form-options";
import { areaNames, cleanCities, matchState } from "@/lib/location/normalise";

/**
 * Free public location services, called straight from the browser. Only what the user types into the pincode or
 * state field is sent; no customer data leaves the app.
 * - India Post pincode directory: https://api.postalpincode.in
 * - CountriesNow city lists: https://countriesnow.space
 */
const PINCODE_API = "https://api.postalpincode.in/pincode";
const CITIES_API = "https://countriesnow.space/api/v0.1/countries/state/cities/q";

export interface PincodeLookup {
  /** The postal district: what most people call the city. */
  district: string;
  /** State name as the form's state list spells it ("" when it is not in the list). */
  state: string;
  /** Local areas (post offices) under this pincode. */
  areas: string[];
}

interface PostOffice {
  Name?: string;
  District?: string;
  State?: string;
}

export async function lookupPincode(pincode: string, signal?: AbortSignal): Promise<PincodeLookup | null> {
  if (!/^\d{6}$/.test(pincode)) return null;
  const response = await fetch(`${PINCODE_API}/${pincode}`, { signal });
  if (!response.ok) throw new Error("The pincode service is not available right now.");
  const body = (await response.json()) as { Status?: string; PostOffice?: PostOffice[] | null }[];
  const offices = body[0]?.Status === "Success" ? body[0].PostOffice ?? [] : [];
  if (!offices.length) return null;
  const first = offices[0];
  return {
    district: first.District?.trim() ?? "",
    state: matchState(first.State ?? "", STATE_OPTIONS),
    areas: areaNames(offices.map((office) => office.Name ?? "")),
  };
}

export async function fetchStateCities(state: string, signal?: AbortSignal): Promise<string[]> {
  const params = new URLSearchParams({ country: "India", state });
  const response = await fetch(`${CITIES_API}?${params}`, { signal });
  if (!response.ok) throw new Error("The city list is not available right now.");
  const body = (await response.json()) as { error?: boolean; data?: string[] };
  return body.error || !Array.isArray(body.data) ? [] : cleanCities(body.data);
}
