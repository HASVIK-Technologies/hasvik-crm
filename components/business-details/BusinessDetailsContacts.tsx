import React from "react";
import { User, Phone, Mail, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";

// 1. Tell TypeScript we need the businessData
interface ContactsProps {
  businessData: any;
}

export default function BusinessDetailsContacts({ businessData }: ContactsProps) {
  // We must include this helper function so the phone links work!
  const cleanNumber = (num: string) => num.replace(/\D/g, '');

  return (
    <Card className="border-0 shadow-none bg-transparent">
       <div className="w-full">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Contact Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Phone List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Phone Numbers</h4>
                  {businessData.contactInfo.phones.map((phone: any) => (
                    <div key={phone.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{phone.number}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={`${phone.badgeClass} font-normal border-0`}>{phone.type}</Badge>
                        <a href={`tel:${cleanNumber(phone.number)}`}><Phone className="w-4 h-4 text-emerald-600 hover:text-emerald-700" /></a>
                        <button><Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" /></button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-blue-600 border-dashed hover:text-blue-700"><Plus className="w-4 h-4 mr-2" /> Add Phone Number</Button>
                </div>

                {/* WhatsApp List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">WhatsApp Numbers</h4>
                  {businessData.contactInfo.whatsapps.map((wa: any) => (
                    <div key={wa.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{wa.number}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={`${wa.badgeClass} font-normal border-0`}>{wa.type}</Badge>
                        <a href={`https://wa.me/91${cleanNumber(wa.number)}`} target="_blank" rel="noopener noreferrer">
                           <WhatsAppIcon className="w-4 h-4 text-emerald-600 hover:text-emerald-700" />
                        </a>
                        <button><Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" /></button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-blue-600 border-dashed hover:text-blue-700"><Plus className="w-4 h-4 mr-2" /> Add WhatsApp Number</Button>
                </div>
                
                {/* Email List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Email</h4>
                  {businessData.contactInfo.emails.map((emailObj: any) => (
                    <div key={emailObj.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">{emailObj.email}</span>
                      </div>
                      <button><Trash2 className="w-4 h-4 text-red-500 hover:text-red-600 shrink-0" /></button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-blue-600 border-dashed hover:text-blue-700"><Plus className="w-4 h-4 mr-2" /> Add Email</Button>
                </div>

              </div>
            </div>
          </div>
    </Card>
  );
}