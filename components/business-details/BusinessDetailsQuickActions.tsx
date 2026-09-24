import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Edit2, FileText, Phone, Slash } from "lucide-react";
import { useModalStore } from "@/store/business-modal-store";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";

interface QuickActionsProps {
  business: any;
  cleanNumber: (num: string) => string;
}

export default function BusinessDetailsQuickActions({ business, cleanNumber }: QuickActionsProps) {
  const { openFollowUpModal, openDeactivateModal } = useModalStore();

  // 1. Check if the business is currently Inactive
  const isInactive = business.status?.toLowerCase() === "inactive";
  
  // 2. A special CSS class we add to disabled buttons so they look faded out
  const disabledStyles = isInactive ? "opacity-50 pointer-events-none cursor-not-allowed" : "";

  return (
    <div className="flex flex-col rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_4px_20px_rgba(20,40,60,0.03)] sm:p-6">
      <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-800">Quick Actions</h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        
        <Button 
          disabled={isInactive}
          onClick={() => openFollowUpModal(business.id)} 
          variant="outline" 
          className={`h-11 justify-start border-slate-200 text-emerald-600 ${disabledStyles}`}
        >
          <Calendar className="mr-3 size-4" /> Add Follow-up
        </Button>

        <Button disabled={isInactive} variant="outline" className={`h-11 justify-start border-slate-200 text-blue-600 ${disabledStyles}`} asChild>
          <Link href={`/businesses/form/${business.id}`}>
            <Edit2 className="mr-3 size-4" /> Edit Business
          </Link>
        </Button>
        { /*
        <Button disabled={isInactive} variant="outline" className={`h-11 justify-start border-slate-200 text-amber-500 ${disabledStyles}`}>
          <FileText className="mr-3 size-4" /> Add Note
        </Button>*/}

        <Button disabled={isInactive} variant="outline" className={`h-11 justify-start border-slate-200 text-emerald-600 ${disabledStyles}`} asChild>
          <a href={`tel:${cleanNumber(business.phone)}`}>
            <Phone className="mr-3 size-4" /> Call Business
          </a>
        </Button>

        <Button disabled={isInactive} variant="outline" className={`h-11 justify-start border-slate-200 text-emerald-600 ${disabledStyles}`} asChild>
          <a href={`https://wa.me/91${cleanNumber(business.phone)}`} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="mr-3 size-4" /> WhatsApp Business
          </a>
        </Button>

        {/* 3. The Smart Toggle Button! (This one is NEVER disabled) */}
        <Button 
          onClick={() => openDeactivateModal(business.id)} 
          variant="outline" 
          className={`h-11 justify-start ${isInactive ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"}`}
        >
          <Slash className="mr-3 size-4" /> 
          {isInactive ? "Activate Business" : "Deactivate Business"}
        </Button>

      </div>
    </div>
  );
}