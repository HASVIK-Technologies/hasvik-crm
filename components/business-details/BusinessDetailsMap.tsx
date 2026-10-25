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
      <div className="bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Location</h3>
        </div>
        <div className="bg-slate-50 rounded-lg h-60 flex flex-col items-center justify-center border border-slate-200 text-slate-400 gap-2">
          <MapPin className="w-8 h-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Location not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 p-2 shadow-sm">
      <div className="bg-slate-100 rounded-lg h-90 relative overflow-hidden border border-slate-200">
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
