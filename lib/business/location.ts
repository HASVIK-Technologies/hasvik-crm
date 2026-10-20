/**
 * Location and Maps utility functions.
 * Handles validation of location URLs, extraction of embed URLs,
 * and determination of whether valid location data exists.
 */

/**
 * Validates and cleans a raw location URL.
 * Filters out invalid protocols, dummy strings, placeholders, and non-URL addresses.
 */
export function getValidLocationUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  let url = rawUrl.trim();
  if (!url) return null;

  // Extract from iframe snippet if an embed code was pasted
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1].trim();
  }

  const lower = url.toLowerCase();

  // Filter out dummy/placeholder values
  if (
    lower === "dummy" ||
    lower.startsWith("dummy") ||
    lower.startsWith("http://dummy") ||
    lower.startsWith("https://dummy") ||
    lower.includes("example.com") ||
    lower.includes("placeholder") ||
    lower === "https://maps.google.com/..." ||
    lower === "location not available"
  ) {
    return null;
  }

  // Must be a valid HTTP/HTTPS URL
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    // Check if host is valid
    if (!parsed.hostname || parsed.hostname === "dummy" || parsed.hostname.endsWith(".dummy")) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

/**
 * Derives a valid physical location query string from a business object.
 * Returns null if no valid address or city is available (rejects dummy / default strings).
 */
export function getValidLocationQuery(business?: {
  name?: string;
  address?: string | null;
  city?: string | null;
} | null): string | null {
  if (!business) return null;

  const rawAddress = typeof business.address === "string" ? business.address.trim() : "";
  const rawCity = typeof business.city === "string" ? business.city.trim() : "";

  const isAddressValid =
    rawAddress.length > 0 &&
    rawAddress.toLowerCase() !== "address not provided" &&
    rawAddress.toLowerCase() !== "address not available" &&
    rawAddress.toLowerCase() !== "location not available" &&
    rawAddress.toLowerCase() !== "dummy";

  const isCityValid =
    rawCity.length > 0 &&
    rawCity.toLowerCase() !== "all cities" &&
    rawCity.toLowerCase() !== "city not provided" &&
    rawCity.toLowerCase() !== "dummy";

  if (!isAddressValid && !isCityValid) {
    return null;
  }

  const parts = [
    business.name?.trim(),
    isAddressValid ? rawAddress : undefined,
    isCityValid ? rawCity : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

/**
 * Transforms a valid location URL or query into an embeddable Google Maps iframe src.
 */
export function getMapEmbedUrl(
  locationUrl?: string | null,
  fallbackQuery?: string | null,
): string | null {
  const validUrl = getValidLocationUrl(locationUrl);
  if (validUrl) {
    // Already an embed URL
    if (validUrl.includes("/maps/embed") || validUrl.includes("output=embed")) {
      return validUrl;
    }

    try {
      const parsed = new URL(validUrl);

      // Search parameter q or query
      const q = parsed.searchParams.get("q") || parsed.searchParams.get("query");
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      }

      // /maps/place/<PlaceName>
      const placeMatch = parsed.pathname.match(/\/place\/([^/@]+)/);
      if (placeMatch && placeMatch[1]) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
        return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      }

      // Coordinates /@lat,lng
      const coordMatch = parsed.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      }

      // Google Maps CID
      const cid = parsed.searchParams.get("cid");
      if (cid) {
        return `https://maps.google.com/maps?cid=${encodeURIComponent(cid)}&output=embed`;
      }
    } catch {
      // Ignore URL parsing errors
    }

    // If it's a google.com/maps or maps.google.com URL, append output=embed
    if (validUrl.includes("google.com/maps") || validUrl.includes("maps.google.com")) {
      const separator = validUrl.includes("?") ? "&" : "?";
      return `${validUrl}${separator}output=embed`;
    }
  }

  // Fallback to valid query if available
  if (fallbackQuery && fallbackQuery.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      fallbackQuery.trim(),
    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  }

  return null;
}

export type BusinessLocationResult = {
  isAvailable: boolean;
  mapLink: string | null;
  embedSrc: string | null;
  displayText: string;
};

/**
 * Returns comprehensive location information for a business.
 * If no valid location URL and no valid address/city exists, returns isAvailable: false.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocationData(business?: any): BusinessLocationResult {
  if (!business) {
    return {
      isAvailable: false,
      mapLink: null,
      embedSrc: null,
      displayText: "Location not available",
    };
  }

  const rawUrl =
    business.locationUrl ||
    (typeof business.location === "string" ? business.location : business.location?.url);

  const validUrl = getValidLocationUrl(rawUrl);
  const locationQuery = getValidLocationQuery(business);

  if (validUrl) {
    const embedSrc = getMapEmbedUrl(validUrl, locationQuery);
    return {
      isAvailable: true,
      mapLink: validUrl,
      embedSrc,
      displayText: locationQuery || business.address || business.city || "Location available",
    };
  }

  if (locationQuery) {
    const encoded = encodeURIComponent(locationQuery);
    return {
      isAvailable: true,
      mapLink: `https://maps.google.com/?q=${encoded}`,
      embedSrc: `https://maps.google.com/maps?q=${encoded}&t=&z=14&ie=UTF8&iwloc=&output=embed`,
      displayText: locationQuery,
    };
  }

  return {
    isAvailable: false,
    mapLink: null,
    embedSrc: null,
    displayText: "Location not available",
  };
}

/**
 * Safely opens a Google Maps URL in a new tab exactly once, preventing double firing.
 */
export function openGoogleMapsOnce(
  e: { preventDefault: () => void; stopPropagation: () => void },
  url: string | null | undefined,
): void {
  e.preventDefault();
  e.stopPropagation();
  if (url && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
