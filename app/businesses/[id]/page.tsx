"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import OutlinedButton from "@/components/common/OutlinedButton";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import Actions from "@/components/common/Actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import businessData from "@/data/businessData.json";
import BusinessDetailsMap from "../../../components/business-details/BusinessDetailsMap";
import BusinessDetailsOverview from "../../../components/business-details/BusinessDetailsOverview";
import BusinessDetailsQuickActions from "../../../components/business-details/BusinessDetailsQuickActions";
// import PhoneButton from "../../../components/business-details/business-details-header/PhoneButton";
import BusinessDetailsContacts from "../../../components/business-details/BusinessDetailsContacts";
import { useBusinessFollowUpsQuery } from "@/hooks/use-business-get-follow-ups";
import { useModalStore } from "@/store/business-modal-store";
import { AddFollowUpModal } from "@/components/business-details/AddFollowUpModal";


import {
  Edit2,
  ArrowLeft,
  Phone,
  MapPin,
  Building2,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import {
  useBusinessQuery,
} from "@/hooks/use-businesses";
import { BusinessItem } from "@/types/business";
import { ChangeBusinessStatusModal } from "@/components/businesses";
import { Button } from "@/components/ui/button";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import { REMINDER_OPTIONS } from "@/lib/business/form-options";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BusinessDetailsFollowups from "@/components/business-details/BusinessDetailsFollowups";
import { DeactivateBusinessModal } from "@/components/business-details/DeactivateBusinessModal";

type ContactItem = {
  id: number | string;
  number: string;
  type: string;
  badgeClass?: string;
};

type EmailItem = {
  id: number | string;
  email: string;
};

type TabItem = {
  id: string;
  label: string;
};

type FollowUpItem = {
  id: number | string;
  date: string;
  badgeClass?: string;
  badge?: string;
  type: string;
  summary: string;
  details: string;
  assignee: string;
  phone: string;
};

const STATIC_BUSINESS_12: BusinessItem = {
  id: 12,
  name: "Hasvik Technology",
  phone: "9876543210",
  initials: "HT",
  avatarBg: "bg-primary/10",
  avatarTextColor: "text-primary",
  category: "Furniture Shop",
  city: "Ballia",
  status: "Active",
  lastFollowUp: "25 Aug 2026 at 11:30 AM",
  nextFollowUp: "Today at 10:00 AM",
  nextFollowUpType: "today",
  owner: "Contact 1 (Owner)",
  address: "Ballia, U.P.",
  leadSource: "Website",
  businessType: "Retailer",
  assignedTo: "Amit Sharma",
};

export default function BusinessDetails() {
  const cleanNumber = (num: string) => num.replace(/\D/g, "");

  const params = useParams();


  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const stringId = typeof rawId === "string" ? rawId : "";
  const { data: followUps } = useBusinessFollowUpsQuery(stringId);
  const realFollowUpsCount = Array.isArray(followUps) ? followUps.length : 0;
  const {
    data: apiBusiness,
    isError,
    isLoading,
  } = useBusinessQuery(typeof rawId === "string" ? rawId : undefined);
  const numericId = typeof rawId === "string" ? parseInt(rawId, 10) : NaN;
  // For /businesses/12, always provide the static Hasvik Technology data as requested
  const business =
    apiBusiness ?? (numericId === 12 ? STATIC_BUSINESS_12 : undefined);
  const { openFollowUpModal, openDeactivateModal } = useModalStore();
  const isInactive = business?.isActive === false;

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl py-12 text-center text-sm text-red-600">
        Unable to load this business. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl py-12 text-center text-sm text-[#64748b]">
        Loading business details...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#fff1f2] text-[#e11d48]">
          <AlertCircle className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#334155]">
          Business not found
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#64748b]">
          The business with ID #{rawId} does not exist or has been removed.
        </p>
        <OutlinedButton asChild className="mt-6 gap-2">
          <Link href="/businesses">
            <ArrowLeft className="size-4" /> Back to Businesses
          </Link>
        </OutlinedButton>
      </div>
    );
  }

  return (
    <DetailsPageLayout
      breadcrumb={
        <Breadcrumb
          items={[
            { label: "Businesses", href: "/businesses" },
            { label: "Business Details" },
          ]}
        />
      }
      actions={
        <Actions
          primary={{
            label: "Edit Business",
            icon: <Edit2 className="size-4" />,
            href: `/businesses/form/${business.id}`
          }}
          secondary={[
            {
              label: "Add Follow Up",
              disabled: isInactive, // Lock it if inactive!
              onSelect: () => openFollowUpModal(String(business?.id)) // Open the modal!
            },
            {
              label: isInactive ? "Activate" : "Deactivate",
              // Open the Deactivate/Activate modal!
              onSelect: () => openDeactivateModal(String(business?.id))
            },
          ]}
        />
      }
      content={
        <>
          {/* 2. SINGLE MERGED CARD (Full Width) */}
          <Card className="w-full overflow-hidden rounded-2xl border-[#e4ecf2] shadow-[0_4px_20px_rgba(20,40,60,0.04)]">
            <CardHeader className="flex flex-col gap-5 border-b border-[#e8eef4] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex min-w-0 items-start gap-4">
                <Avatar className="size-16 rounded-2xl">
                  <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                    {business.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-0.5 flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="truncate text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl">
                      {business.name}
                    </CardTitle>
                    <StatusBadge status={isInactive ? "Inactive" : "Active"} />
                  </div>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#64748b]">
                    <Building2 className="size-4 shrink-0 text-[#94a3b8]" />
                    <span>{business.category || "Uncategorized"}</span>
                    {business.city && (
                      <>
                        <span aria-hidden="true" className="text-[#cbd5e1]">·</span>
                        <span>{business.city}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {businessData.contactInfo.phones?.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <OutlinedButton aria-label="Call business" title="Call business" className="h-9 w-9 p-0 flex items-center justify-center text-brand-green-strong border-gray-200 hover:bg-brand-green/10">
                        <Phone className="h-4 w-4" />
                      </OutlinedButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {businessData.contactInfo.phones.map((p: ContactItem) => (
                        <DropdownMenuItem
                          key={p.id}
                          asChild
                          className="cursor-pointer"
                        >
                          <a
                            href={`tel:${cleanNumber(p.number)}`}
                            className="w-full"
                          >
                            {p.number} ({p.type})
                          </a>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : businessData.contactInfo.phones?.length === 1 ? (
                  <OutlinedButton
                    asChild
                    aria-label="Call business"
                    className="h-9 w-9 p-0 flex items-center justify-center text-brand-green-strong border-gray-200 hover:bg-brand-green/10"
                  >
                    <a
                      href={`tel:${cleanNumber(businessData.contactInfo.phones[0].number)}`}
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </OutlinedButton>
                ) : null}

                {businessData.contactInfo.whatsapps?.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <OutlinedButton aria-label="Message business on WhatsApp" title="Message business on WhatsApp" className="h-9 w-9 p-0 flex items-center justify-center text-brand-green-strong border-gray-200 hover:bg-brand-green/10">
                        <WhatsAppIcon className="h-4 w-4" />
                      </OutlinedButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {businessData.contactInfo.whatsapps.map(
                        (w: ContactItem) => (
                          <DropdownMenuItem
                            key={w.id}
                            asChild
                            className="cursor-pointer"
                          >
                            <a
                              href={`https://wa.me/91${cleanNumber(w.number)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full"
                            >
                              {w.number} ({w.type})
                            </a>
                          </DropdownMenuItem>
                        ),
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : businessData.contactInfo.whatsapps?.length === 1 ? (
                  <OutlinedButton
                    asChild
                    aria-label="Message business on WhatsApp"
                    className="h-9 w-9 p-0 flex items-center justify-center text-brand-green-strong border-gray-200 hover:bg-brand-green/10"
                  >
                    <a
                      href={`https://wa.me/91${cleanNumber(businessData.contactInfo.whatsapps[0].number)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                    </a>
                  </OutlinedButton>
                ) : null}

                <OutlinedButton
                  asChild
                  aria-label="View business location"
                  title="View business location"
                  className="h-9 w-9 p-0 flex items-center justify-center text-primary border-gray-200 hover:bg-primary/10"
                >
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(business.name + " " + (business.address || business.city))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4" />
                  </a>
                </OutlinedButton>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50/80 p-3.5">
                  <Users className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Assigned to</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {business.assignedTo || "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50/80 p-3.5">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Next follow-up</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {business.nextFollowUp || "Not scheduled"}
                      </p>
                      {business.nextFollowUpType && (
                        <StatusBadge
                          status={business.nextFollowUpType}
                          className="h-5 py-0 text-[10px]"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50/80 p-3.5">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Last follow-up</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {business.lastFollowUp || "No previous follow-up"}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50/80 p-3.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Address</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">
                      {business.address || businessData.businessInfo.address || "Address not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. --- TABS SECTION --- */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="max-w-full justify-start overflow-x-auto">
              {businessData.tabs
                .filter((tab: any) => tab.id !== "activity-log" && tab.id !== "Notes")
                .map((tab: any) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-none"
                  >
                    {tab.label}

                    {/* Contacts: Deleted the old number code! */}
                    {/* Follow-ups: Using the REAL TanStack count! */}
                    {tab.id === "follow-ups" && ` (${realFollowUpsCount})`}

                  </TabsTrigger>
                ))}
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-6">
                <BusinessDetailsOverview
                  business={business}
                  businessData={businessData}
                />
                <BusinessDetailsQuickActions
                  business={business}
                  cleanNumber={cleanNumber}

                />
              </div>
              <BusinessDetailsMap business={business} />
            </TabsContent>

            {/* CONTACTS TAB */}
            <TabsContent value="contacts" className="mt-6">
              <BusinessDetailsContacts businessData={businessData} />
            </TabsContent>

            {/* FOLLOW-UPS TAB */}
            <TabsContent value="follow-ups" className="mt-6">
              <BusinessDetailsFollowups />

            </TabsContent>
            {/* NOTES TAB 
            <TabsContent value="notes" className="mt-6"></TabsContent> */}

          </Tabs>
          {/* New Follow-up Modal */}
          <AddFollowUpModal businessName={business?.name || "Business"} />
          {/* Deactivate Business Modal */}
          <DeactivateBusinessModal
            businessName={business?.name || ""}
            businessStatus={business?.status || ""}
            businessIsActive={business.isActive}
          />
        </>
      }
    />
  );
}
