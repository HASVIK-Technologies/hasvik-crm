// BusinessDetailsMap.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { MapPin } from "lucide-react";
import {
  getLocationData,
  getMapEmbedUrl,
} from "@/lib/business/location";

// Re-export getMapEmbedUrl for backwards compatibility
export { getMapEmbedUrl };

interface MapProps {
  business: any;
}

export default function BusinessDetailsMap({ business }: MapProps) {
  const locationData = getLocationData(business);

  if (!locationData.isAvailable || !locationData.embedSrc) {
    return (
      <div className="bg-surface border border-line p-6 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink">Location</h3>
        </div>
        <div className="bg-surface-2 rounded-lg h-60 flex flex-col items-center justify-center border border-line text-muted gap-2">
          <MapPin className="w-8 h-8 text-muted" />
          <p className="text-sm font-medium text-muted">Location not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-line p-2 shadow-sm">
      <div className="bg-surface-2 rounded-lg h-90 relative overflow-hidden border border-line">
        <iframe
          src={locationData.embedSrc}
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
