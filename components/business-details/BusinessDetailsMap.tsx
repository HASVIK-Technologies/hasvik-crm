// BusinessDetailsMap.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

// 1. Define the props (the data this file needs to receive)
interface MapProps {
  business: any; // We are telling this file to expect 'business' data
}

export function getMapEmbedUrl(
  locationUrl?: string | null,
  fallbackQuery?: string
): string {
  if (locationUrl && typeof locationUrl === "string" && locationUrl.trim()) {
    let url = locationUrl.trim();

    // If an iframe snippet was pasted, extract src
    const iframeMatch = url.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      url = iframeMatch[1];
    }

    // Already an embed URL
    if (url.includes("/maps/embed") || url.includes("output=embed")) {
      return url;
    }

    try {
      const parsed = new URL(url);

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
      // Ignore URL parsing errors and continue
    }

    // If it's a google.com/maps or maps.google.com URL, append output=embed
    if (url.includes("google.com/maps") || url.includes("maps.google.com")) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}output=embed`;
    }
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(
    fallbackQuery || ""
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
}

// 2. Create the component and receive the props
export default function BusinessDetailsMap({ business }: MapProps) {
  const savedLocationUrl =
    business?.locationUrl ||
    (typeof business?.location === "string"
      ? business.location
      : business?.location?.url);

  const fallbackQuery = [
    business?.name,
    business?.address || business?.city,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  let cleanExternalUrl = savedLocationUrl;
  if (cleanExternalUrl && typeof cleanExternalUrl === "string") {
    const iframeMatch = cleanExternalUrl.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      cleanExternalUrl = iframeMatch[1];
    }
  }

  const mapLink =
    cleanExternalUrl ||
    `https://maps.google.com/?q=${encodeURIComponent(fallbackQuery)}`;

  const embedSrc = getMapEmbedUrl(savedLocationUrl, fallbackQuery);

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Location</h3>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-1.5 text-primary border-slate-200 hover:bg-primary/5"
        >
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4" /> Open in Maps
          </a>
        </Button>
      </div>
      <div className="bg-slate-100 rounded-lg h-90 relative overflow-hidden border border-slate-200">
        <iframe
          src={embedSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}