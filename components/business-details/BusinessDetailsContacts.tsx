/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";

interface ContactsProps {
  business: any;
  businessData?: any;
}

export default function BusinessDetailsContacts({ business }: ContactsProps) {
  const cleanNumber = (num: string) => (num ? String(num).replace(/\D/g, "") : "");

  // 1. Get real phone numbers with fallback to primary phone
  const phones: any[] =
    business?.phoneNumbers && business.phoneNumbers.length > 0
      ? business.phoneNumbers
      : business?.phone
        ? [{ number: business.phone, isPrimary: true }]
        : [];

  // 2. Get real WhatsApp numbers with fallback to alternate phone
  const whatsapps: any[] =
    business?.whatsappNumbers && business.whatsappNumbers.length > 0
      ? business.whatsappNumbers
      : business?.alternatePhone
        ? [{ number: business.alternatePhone, isPrimary: true }]
        : [];

  // 3. Get real business email
  const email: string | undefined = business?.email;

  return (
    <div className="w-full">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800">Contact Information</h3>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Phone Numbers Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Phone Numbers</h4>
            {phones.length === 0 ? (
              <p className="text-sm text-slate-400">No phone numbers provided.</p>
            ) : (
              phones.map((phone: any, index: number) => {
                const num = phone.number || phone;
                return (
                  <div
                    key={phone.id || phone._id || index}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <span className="text-sm font-medium text-slate-700">{num}</span>
                    <div className="flex items-center gap-3">
                      {phone.isPrimary && (
                        <Badge
                          variant="secondary"
                          className="border-0 bg-green-50 font-normal text-green-700"
                        >
                          Primary
                        </Badge>
                      )}
                      <a
                        href={`tel:${cleanNumber(num)}`}
                        aria-label={`Call ${num}`}
                      >
                        <Phone className="size-4 text-brand-green-strong hover:text-brand-green" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* WhatsApp Numbers Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">WhatsApp Numbers</h4>
            {whatsapps.length === 0 ? (
              <p className="text-sm text-slate-400">No WhatsApp numbers provided.</p>
            ) : (
              whatsapps.map((wa: any, index: number) => {
                const num = wa.number || wa;
                return (
                  <div
                    key={wa.id || wa._id || index}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <span className="text-sm font-medium text-slate-700">{num}</span>
                    <div className="flex items-center gap-3">
                      {wa.isPrimary && (
                        <Badge
                          variant="secondary"
                          className="border-0 bg-green-50 font-normal text-green-700"
                        >
                          Primary
                        </Badge>
                      )}
                      <a
                        href={`https://wa.me/91${cleanNumber(num)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Chat on WhatsApp with ${num}`}
                      >
                        <WhatsAppIcon className="size-4 text-brand-green-strong hover:text-brand-green" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Email Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Email</h4>
            {email ? (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="size-4 shrink-0 text-slate-400" />
                  <a
                    href={`mailto:${email}`}
                    className="truncate text-sm font-medium text-slate-700 hover:text-primary hover:underline"
                  >
                    {email}
                  </a>
                </div>
                <Badge
                  variant="secondary"
                  className="border-0 bg-green-50 font-normal text-green-700"
                >
                  Primary
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No email provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}