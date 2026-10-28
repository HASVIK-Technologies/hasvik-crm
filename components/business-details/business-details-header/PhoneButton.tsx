import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Phone } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import OutlinedButton from "@/components/common/OutlinedButton";

interface PhoneProps {
  phones: any[];
}

export default function PhoneButton({ phones }: PhoneProps) {
  const cleanNumber = (num: string) => num.replace(/\D/g, '');
  if (!phones || phones.length === 0) return null;
  if (phones.length === 1) {
    return (
      <OutlinedButton asChild className="h-9 w-9 p-0 flex items-center justify-center text-accent-strong border-line hover:bg-surface-2/10">
        <a href={`tel:${cleanNumber(phones[0].number)}`}>
          <Phone className="h-4 w-4" />
        </a>
      </OutlinedButton>
    );
  }

  // 3. If multiple phones exist, show the Dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <OutlinedButton className="h-9 w-9 p-0 flex items-center justify-center text-accent-strong border-line hover:bg-surface-2/10">
          <Phone className="h-4 w-4" />
        </OutlinedButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {phones.map((p: any) => (
          <DropdownMenuItem key={p.id} asChild className="cursor-pointer">
            <a href={`tel:${cleanNumber(p.number)}`}>
              {p.number}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}