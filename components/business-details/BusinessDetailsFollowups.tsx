import React from "react";
import { useParams } from "next/navigation"; // To get the business ID from the URL
import { Badge } from "@/components/ui/badge";
import { Phone, MoreVertical } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { useBusinessFollowUpsQuery } from "@/hooks/use-business-get-follow-ups"; // Your new hook!

export default function BusinessDetailsFollowups() {
  const cleanNumber = (num: string) => num.replace(/\D/g, '');
  
  // 1. Get the ID from the URL
  const params = useParams();
  const businessId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // 2. Fetch the real data!
  const { data: followUps, isLoading, isError } = useBusinessFollowUpsQuery(businessId as string);

  // 3. Handle loading state
  if (isLoading) return <div className="p-6 text-slate-500">Loading follow-ups...</div>;
  if (isError) return <div className="p-6 text-red-500">Failed to load follow-ups.</div>;

  // 4. Default to empty array if no data
  const followUpsList = Array.isArray(followUps) ? followUps : [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Recent Follow-ups</h3>
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <tbody>
            
            {/* 5. Map over the REAL data instead of businessData */}
            {followUpsList.map((item: any) => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                {/* Format the date beautifully */}
                <td className="py-4 pr-4 font-medium text-slate-900 whitespace-nowrap">
                  {new Date(item.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                
                <td className="py-4 pr-4">
                  <Badge variant="secondary" className="font-normal border-0 bg-blue-50 text-blue-700">
                    {item.status}
                  </Badge>
                </td>
                
                <td className="py-4 pr-4 text-slate-600">{item.type}</td>
                
                <td className="py-4 pr-4 text-slate-900 font-medium">Follow-up</td>
                <td className="py-4 pr-4 text-slate-500 w-1/3">{item.notes || "No notes"}</td>
                
                {/* Fallback to generic name since API only returns AssignedTo ID for now */}
                <td className="py-4 pr-4 text-slate-600">Assignee ID: {item.assignedTo?.substring(0, 5) || "Unassigned"}</td>
                
                <td className="py-4 pl-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button><MoreVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
                  </div>
                </td>
              </tr>
            ))}

            {followUpsList.length === 0 && (
              <tr><td colSpan={7} className="py-4 text-center text-slate-500">No follow-ups found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}