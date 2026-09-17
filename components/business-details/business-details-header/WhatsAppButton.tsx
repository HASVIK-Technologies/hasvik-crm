import React from "react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import OutlinedButton from "@/components/common/OutlinedButton";

interface WhatsAppProps {
  whatsapps: any[];
}

export default function WhatsAppButton({ whatsapps }: WhatsAppProps) {
  const cleanNumber = (num: string) => num.replace(/\D/g, '');

  if (!whatsapps || whatsapps.length === 0) return null;

  if (whatsapps.length === 1) {
    return (
      <OutlinedButton asChild className="h-9 w-9 p-0 flex items-center justify-center text-emerald-600 border-gray-200 hover:bg-emerald-50">
        <a href={`https://wa.me/91${cleanNumber(whatsapps[0].number)}`} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon className="h-4 w-4" />
        </a>
      </OutlinedButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <OutlinedButton className="h-9 w-9 p-0 flex items-center justify-center text-emerald-600 border-gray-200 hover:bg-emerald-50">
          <WhatsAppIcon className="h-4 w-4" />
        </OutlinedButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {whatsapps.map((w: any) => (
          <DropdownMenuItem key={w.id} asChild className="cursor-pointer">
            <a href={`https://wa.me/91${cleanNumber(w.number)}`} target="_blank" rel="noopener noreferrer" className="w-full">
              {w.number} ({w.type})
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}