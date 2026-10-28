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
  const isInactive = business?.isActive === false;
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
      <div className="border border-line bg-surface p-6 shadow-sm rounded-2xl">
        <h3 className="mb-6 text-lg font-bold text-ink">Contact Information</h3>

        <div className="grid grid-cols-1 gap-5">
          {/* Phone Numbers Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink-soft">Phone Numbers</h4>
            {phones.length === 0 ? (
              <p className="text-sm text-muted">No phone numbers provided.</p>
            ) : (
              phones.map((phone: any, index: number) => {
                const num = phone.number || phone;
                return (
                  <div
                    key={phone.id || phone._id || index}
                    className="flex items-center justify-between rounded-lg border border-line p-3"
                  >
                    <span className="text-sm font-medium text-ink-soft">{num}</span>
                    <div className="flex items-center gap-3">
                      {phone.isPrimary && (
                        <Badge
                          variant="secondary"
                          className="border-0 bg-ok-soft font-normal text-ok"
                        >
                          Primary
                        </Badge>
                      )}
                      {!isInactive && <a
                        href={`tel:${cleanNumber(num)}`}
                        aria-label={`Call ${num}`}
                      >
                        <Phone className="size-4 text-accent-strong hover:text-accent-strong" />
                      </a>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* WhatsApp Numbers Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink-soft">WhatsApp Numbers</h4>
            {whatsapps.length === 0 ? (
              <p className="text-sm text-muted">No WhatsApp numbers provided.</p>
            ) : (
              whatsapps.map((wa: any, index: number) => {
                const num = wa.number || wa;
                return (
                  <div
                    key={wa.id || wa._id || index}
                    className="flex items-center justify-between rounded-lg border border-line p-3"
                  >
                    <span className="text-sm font-medium text-ink-soft">{num}</span>
                    <div className="flex items-center gap-3">
                      {wa.isPrimary && (
                        <Badge
                          variant="secondary"
                          className="border-0 bg-ok-soft font-normal text-ok"
                        >
                          Primary
                        </Badge>
                      )}
                      {!isInactive && <a
                        href={`https://wa.me/91${cleanNumber(num)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Chat on WhatsApp with ${num}`}
                      >
                        <WhatsAppIcon className="size-4 text-accent-strong hover:text-accent-strong" />
                      </a>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Email Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink-soft">Email</h4>
            {email ? (
              <div className="flex items-center justify-between rounded-lg border border-line p-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="size-4 shrink-0 text-muted" />
                  {!isInactive ? <a
                    href={`mailto:${email}`}
                    className="truncate text-sm font-medium text-ink-soft hover:text-brand-strong hover:underline"
                  >
                    {email}
                  </a> : <span className="truncate text-sm font-medium text-ink-soft">{email}</span>}
                </div>
                <Badge
                  variant="secondary"
                  className="border-0 bg-ok-soft font-normal text-ok"
                >
                  Primary
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted">No email provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
