import React from "react";
import PhoneButton from "./PhoneButton";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { Building2, MapPin } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import OutlinedButton from "@/components/common/OutlinedButton";
import WhatsAppButton from "./WhatsAppButton";
import EmailButton from "./EmailButton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

// 1. We define the Props so TypeScript knows what data to expect
interface HeaderProps {
  business: any;
  businessData: any;
}

export default function BusinessDetailsHeader({ business, businessData }: HeaderProps) {
  // 2. We copy the cleanNumber function here so the WhatsApp button can use it
  const cleanNumber = (num: string) => num.replace(/\D/g, '');

  return (
    <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-[#eef2f6] bg-[#fbfdff] px-5 py-5 sm:px-7">
          
      {/* LEFT SIDE: Avatar & Name */}
      <div className="flex items-start gap-4">
        <Avatar className="size-16 rounded-2xl">
          <AvatarFallback className="bg-blue-50 text-xl font-semibold text-blue-700">
            {business.initials}
          </AvatarFallback>
        </Avatar>
        <div className="mt-0.5 flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="truncate text-xl tracking-tight text-[#334155] sm:text-2xl">{business.name}</CardTitle>
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
              {business.status}
            </Badge>
          </div>
          <p className="flex items-center gap-2 text-sm text-[#64748b]">
            <Building2 className="size-4 text-[#94a3b8]" />
            {business.category} <span className="text-[#cbd5e1]">/</span> {business.city}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Action Buttons */}
      <div className="flex items-center gap-2">
            
        {/* Your new Phone Component! */}
        <PhoneButton phones={businessData.contactInfo.phones} />
        {/* Maps Button */}
        <OutlinedButton asChild className="h-9 w-9 p-0 flex items-center justify-center text-blue-600 border-gray-200 hover:bg-blue-50">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(business.name + " " + (business.address || business.city))}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin className="h-4 w-4" />
          </a>
        </OutlinedButton>
      </div>

    </CardHeader>
  );
}