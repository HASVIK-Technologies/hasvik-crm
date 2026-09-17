import React from "react";
import { Mail } from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";

interface EmailProps {
  emails: any[];
}

export default function EmailButton({ emails }: EmailProps) {
  if (!emails || emails.length === 0) return null;

  return (
    <OutlinedButton asChild className="h-9 w-9 p-0 flex items-center justify-center text-slate-600 border-gray-200 hover:bg-slate-50">
      <a href={`mailto:${emails[0].email}`}>
        <Mail className="h-4 w-4" />
      </a>
    </OutlinedButton>
  );
}