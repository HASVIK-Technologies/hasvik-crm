import React from "react";
import { Building2, Tags, MapPin, Building, Zap, Globe, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OverviewProps {
  business: any;
  businessData: any;
}

export default function BusinessDetailsOverview({ business, businessData }: OverviewProps) {
  return (
    <div className="rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_4px_20px_rgba(20,40,60,0.03)] sm:p-6">
      <h3 className="mb-6 text-lg font-bold tracking-tight text-slate-800">Business Information</h3>
      <div className="space-y-5">
        <div className="flex items-start gap-3 text-sm">
          <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Business Name</div>
          <div className="text-slate-700 font-medium">{business.name || businessData.businessInfo.name}</div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Tags className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Category</div>
          <div className="text-slate-700 font-medium">{business.category || businessData.businessInfo.category}</div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Address</div>
          <div className="text-slate-700 font-medium leading-relaxed">{business.address || businessData.businessInfo.address}</div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Building className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">City</div>
          <div className="text-slate-700 font-medium">{business.city || businessData.businessInfo.city}</div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Zap className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Status</div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-medium border-0">
            {business.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Globe className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Website</div>
          <a href={business.website || businessData.businessInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
            {business.website || businessData.businessInfo.website}
          </a>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-32 shrink-0 text-slate-500">Email</div>
          <a href={`mailto:${business.email || businessData.businessInfo.email}`} className="text-blue-600 hover:underline font-medium break-all">
            {business.email || businessData.businessInfo.email}
          </a>
        </div>
      </div>
    </div>
  );
}