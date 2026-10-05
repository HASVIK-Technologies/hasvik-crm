import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { useBusinessFollowUpsQuery } from "@/hooks/use-business-get-follow-ups";

interface BusinessFollowUp {
  _id?: string;
  id?: string;
  scheduledAt?: string;
  status?: string;
  type?: string;
  notes?: string;
  assignedTo?: string;
}

export default function BusinessDetailsFollowups({
  businessId,
}: {
  businessId: string;
}) {
  const { data, isLoading, isError } = useBusinessFollowUpsQuery(businessId);

  if (isLoading) return <div className="p-6 text-slate-500">Loading follow-ups...</div>;
  if (isError) return <div className="p-6 text-red-500">Failed to load follow-ups.</div>;

  const followUpsList: BusinessFollowUp[] = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Follow-up</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-sm text-left">
          <tbody>
            {followUpsList.map((item, index) => (
              <tr key={item._id ?? item.id ?? index} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 pr-4 font-medium text-slate-900 whitespace-nowrap">
                  {item.scheduledAt
                    ? new Date(item.scheduledAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "-"}
                </td>
                
                <td className="py-4 pr-4">
                  <Badge variant="secondary" className="font-normal border-0 bg-blue-50 text-blue-700">
                    {item.status || "-"}
                  </Badge>
                </td>
                
                <td className="py-4 pr-4 text-slate-600">{item.type || "-"}</td>
                
                <td className="py-4 pr-4 text-slate-900 font-medium">Follow-up</td>
                <td className="py-4 pr-4 text-slate-500 w-1/3">{item.notes || "No notes"}</td>
                
                <td className="py-4 pr-4 text-slate-600">
                  Assignee ID: {item.assignedTo?.substring(0, 5) || "Unassigned"}
                </td>
                
                <td className="py-4 pl-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button type="button" aria-label="Follow-up actions">
                      <MoreVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    </button>
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