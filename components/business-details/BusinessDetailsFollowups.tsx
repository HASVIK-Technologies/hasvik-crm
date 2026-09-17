import React from "react";
import { Badge } from "@/components/ui/badge";
import { Phone, MoreVertical } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";

interface FollowupsProps {
  businessData: any;
}

export default function BusinessDetailsFollowups({ businessData }: FollowupsProps) {
  // We must include this helper function so the phone links work!
  const cleanNumber = (num: string) => num.replace(/\D/g, '');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Recent Follow-ups</h3>
              <a href="#" className="text-sm font-medium text-blue-600 hover:underline">View All</a>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody>
                  {businessData.recentFollowUps.map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 pr-4 font-medium text-slate-900 whitespace-nowrap">{item.date}</td>
                      <td className="py-4 pr-4">
                        <Badge variant="secondary" className={`${item.badgeClass} font-normal border-0`}>{item.badge}</Badge>
                      </td>
                      <td className="py-4 pr-4 text-slate-600">{item.type}</td>
                      <td className="py-4 pr-4 text-slate-900 font-medium">{item.summary}</td>
                      <td className="py-4 pr-4 text-slate-500 w-1/3">{item.details}</td>
                      <td className="py-4 pr-4 text-slate-600">{item.assignee}</td>
                      <td className="py-4 pl-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <a href={`tel:${cleanNumber(item.phone)}`}><Phone className="w-4 h-4 text-emerald-600 hover:text-emerald-700" /></a>
                          <a href={`https://wa.me/91${cleanNumber(item.phone)}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="w-4 h-4 text-emerald-600 hover:text-emerald-700" /></a>
                          <button><MoreVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {businessData.recentFollowUps.map((item: any) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{item.date}</p>
                      <Badge variant="secondary" className={`mt-1 ${item.badgeClass} font-normal border-0`}>
                        {item.badge}
                      </Badge>
                    </div>
                    <div className="flex gap-3">
                      <a href={`tel:${cleanNumber(item.phone)}`}><Phone className="w-4 h-4 text-emerald-600" /></a>
                      <a href={`https://wa.me/91${cleanNumber(item.phone)}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="w-4 h-4 text-emerald-600" /></a>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.summary} <span className="text-slate-500 font-normal">({item.type})</span></p>
                    <p className="text-sm text-slate-600 mt-1">{item.details}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm text-slate-500">
                    <span>{item.assignee}</span>
                    <button><MoreVertical className="w-4 h-4 text-slate-400" /></button>
                 </div>
            </div>
            ))}
        </div>
    </div>
  );
}