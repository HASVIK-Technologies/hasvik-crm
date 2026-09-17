// BusinessDetailsMap.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

// 1. Define the props (the data this file needs to receive)
interface MapProps {
  business: any; // We are telling this file to expect 'business' data
}

// 2. Create the component and receive the props
export default function BusinessDetailsMap({ business }: MapProps) {
  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Location</h3>
        <div className="bg-slate-100 rounded-lg h-90 mb-4 relative overflow-hidden border border-slate-200">
            <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(business.name + " " + (business.address || business.city))}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
        <Button variant="secondary" className="w-full text-blue-600 bg-blue-50 hover:bg-blue-100">
            <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(business.name + " " + (business.address || business.city))}`} 
            target="_blank" 
            rel="noopener noreferrer"
            >
            <ExternalLink className="w-4 h-4 mr-2"/> Open in Maps
            </a>
        </Button>
    </div>
  );
}