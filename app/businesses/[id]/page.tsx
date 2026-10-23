"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import OutlinedButton from "@/components/common/OutlinedButton";
import Actions from "@/components/common/Actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import businessData from "@/data/businessData.json";
import BusinessDetailsMap from "../../../components/business-details/BusinessDetailsMap";
import BusinessDetailsOverview from "../../../components/business-details/BusinessDetailsOverview";
import BusinessDetailsQuickActions from "../../../components/business-details/BusinessDetailsQuickActions";
import BusinessDetailsContacts from "../../../components/business-details/BusinessDetailsContacts";
import { useBusinessFollowUpsQuery } from "@/hooks/use-business-get-follow-ups";
import { useModalStore } from "@/store/business-modal-store";
import { AddFollowUpModal } from "@/components/business-details/AddFollowUpModal";
import { getLocationData, openGoogleMapsOnce } from "@/lib/business/location";

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
import { useBusinessQuery } from "@/hooks/use-businesses";
import { BusinessItem } from "@/types/business";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import { formatLeadStatus } from "@/lib/business/form-options";
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
  leadStatus: "INTERESTED",
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
  const business =
    apiBusiness ?? (numericId === 12 ? STATIC_BUSINESS_12 : undefined);
  const { openFollowUpModal, openDeactivateModal } = useModalStore();
  const isInactive = business?.isActive === false;
  const upcomingFollowUps = Array.isArray(followUps)
    ? followUps
        .filter((f: any) => f.status === "SCHEDULED")
        .sort(
          (a: any, b: any) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        )
    : [];
  const nextFollowUp =
    upcomingFollowUps.length > 0 ? upcomingFollowUps[0] : null;
  const completedFollowUps = Array.isArray(followUps)
    ? followUps
        .filter((f: any) => f.status === "COMPLETED")
        .sort(
          (a: any, b: any) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        )
    : [];
  const lastFollowUpItem =
    completedFollowUps.length > 0 ? completedFollowUps[0] : null;
  const dateFmt = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const headerPhones: any[] =
    business?.phoneNumbers && business.phoneNumbers.length > 0
      ? business.phoneNumbers
      : business?.phone
      ? [{ number: business.phone, isPrimary: true }]
      : [];

  const headerWhatsapps: any[] =
    business?.whatsappNumbers && business.whatsappNumbers.length > 0
      ? business.whatsappNumbers
      : business?.alternatePhone
      ? [{ number: business.alternatePhone, isPrimary: true }]
      : [];

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

  const locationData = getLocationData(business);

  const rawLeadStatus =
    (business?.leadStatus &&
    business.leadStatus !== "Active" &&
    business.leadStatus !== "Inactive"
      ? business.leadStatus
      : undefined) ||
    (business?.status &&
    business.status !== "Active" &&
    business.status !== "Inactive"
      ? business.status
      : undefined) ||
    business?.leadStatus;

  const leadStatusDisplay = formatLeadStatus(rawLeadStatus);

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
            href: `/businesses/form/${business.id}`,
            disabled: isInactive,
          }}
          secondary={[
            {
              label: "Add Follow Up",
              disabled: isInactive, // Lock it if inactive!
              onSelect: () => openFollowUpModal(String(business?.id)), // Open the modal!
            },
            {
              label: isInactive ? "Activate" : "Deactivate",
              // Open the Deactivate/Activate modal!
              onSelect: () => openDeactivateModal(String(business?.id)),
            },
          ]}
        />
      }
      content={
        <>
          {/* 2. SINGLE MERGED CARD (Full Width) */}
          <Card className="w-full overflow-hidden rounded-2xl border-[#e4ecf2] shadow-[0_4px_20px_rgba(20,40,60,0.04)]">
            <CardHeader className="flex flex-col gap-4 border-b border-[#e8eef4] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:px-7">
              <div className="flex min-w-0 w-full flex-1 items-start gap-3 sm:gap-4">
                <Avatar className="size-13 sm:size-16 rounded-xl sm:rounded-2xl shrink-0">
                  <AvatarFallback className="bg-primary/10 text-base sm:text-xl font-semibold text-primary">
                    {business.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-0.5 flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <CardTitle className="text-lg font-bold tracking-tight text-[#0f172a] sm:text-2xl break-words min-w-0">
                      {business.name}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <StatusBadge
                        status={isInactive ? "Inactive" : "Active"}
                      />
                      {leadStatusDisplay && leadStatusDisplay !== "-" && (
                        <StatusBadge
                          status={rawLeadStatus || leadStatusDisplay}
                          label={leadStatusDisplay}
                        />
                      )}
                    </div>
                  </div>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-[#64748b]">
                    <Building2 className="size-3.5 sm:size-4 shrink-0 text-[#94a3b8]" />
                    <span>{business.category || "Uncategorized"}</span>
                    {business.city && (
                      <>
                        <span aria-hidden="true" className="text-[#cbd5e1]">
                          ·
                        </span>
                        <span>{business.city}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {!isInactive && (
                  <>
                    {/* Phone Dropdown / Single Button */}
                    {headerPhones.length > 1 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <OutlinedButton
                            aria-label="Call business"
                            title="Call business"
                            className="h-9 w-9 p-0 flex items-center justify-center text-brand-green-strong border-gray-200 hover:bg-brand-green/10"
                          >
                            <Phone className="h-4 w-4" />
                          </OutlinedButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {headerPhones.map((p: any, idx: number) => (
                            <DropdownMenuItem
                              key={p.id || p._id || idx}
                              asChild
                              className="cursor-pointer"
                            >
                              <a
                                href={`tel:${cleanNumber(p.number)}`}
                                className="w-full"
                              >
                                {p.number} (
                                {p.type ||
                                  (p.isPrimary ? "Primary" : "Secondary")}
                                )
                              </a>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : headerPhones.length === 1 ? (
                      <OutlinedButton
                        asChild
                        aria-label="Call business"
                        className="h-9 w-9 p-0 flex items-center justify-center text-brand-green-strong border-gray-200 hover:bg-brand-green/10"
                      >
                        <a href={`tel:${cleanNumber(headerPhones[0].number)}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </OutlinedButton>
                    ) : null}

                    {/* WhatsApp Dropdown / Single Button */}
                    {headerWhatsapps.length > 1 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <OutlinedButton
                            aria-label="Message business on WhatsApp"
                            title="Message business on WhatsApp"
                            className="h-9 w-9 p-0 flex items-center justify-center text-brand-green-strong border-gray-200 hover:bg-brand-green/10"
                          >
                            <WhatsAppIcon className="h-4 w-4" />
                          </OutlinedButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {headerWhatsapps.map((w: any, idx: number) => (
                            <DropdownMenuItem
                              key={w.id || w._id || idx}
                              asChild
                              className="cursor-pointer"
                            >
                              <a
                                href={`https://wa.me/91${cleanNumber(
                                  w.number
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                              >
                                {w.number} (
                                {w.type ||
                                  (w.isPrimary ? "Primary" : "Secondary")}
                                )
                              </a>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : headerWhatsapps.length === 1 ? (
                      <OutlinedButton
                        asChild
                        aria-label="Message business on WhatsApp"
                        className="h-9 w-9 p-0 flex items-center justify-center text-brand-green-strong border-gray-200 hover:bg-brand-green/10"
                      >
                        <a
                          href={`https://wa.me/91${cleanNumber(
                            headerWhatsapps[0].number
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                        </a>
                      </OutlinedButton>
                    ) : null}
                  </>
                )}

                {locationData.isAvailable ? (
                  <OutlinedButton
                    asChild
                    aria-label="View business location on Google Maps"
                    title="View business location on Google Maps"
                    className="h-9 w-9 p-0 flex items-center justify-center text-primary border-gray-200 hover:bg-primary/10 cursor-pointer"
                  >
                    <a
                      href={locationData.mapLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) =>
                        openGoogleMapsOnce(e, locationData.mapLink)
                      }
                    >
                      <MapPin className="h-4 w-4" />
                    </a>
                  </OutlinedButton>
                ) : (
                  <OutlinedButton
                    disabled
                    aria-disabled="true"
                    aria-label="Location not available"
                    title="Location not available"
                    className="h-9 w-9 p-0 flex items-center justify-center text-slate-300 border-gray-200 opacity-50 cursor-not-allowed"
                  >
                    <MapPin className="h-4 w-4" />
                  </OutlinedButton>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50/80 p-3.5">
                  <Users className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Assigned to
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {nextFollowUp
                        ? nextFollowUp.assignedToName
                        : business.assignedTo || "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50/80 p-3.5">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Next follow-up
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {nextFollowUp ? (
                        <>
                          <p className="text-sm font-semibold text-slate-800">
                            {dateFmt.format(new Date(nextFollowUp.scheduledAt))}
                          </p>
                          <Link
                            href={`/follow-ups/${nextFollowUp.id}`}
                            className="inline-flex h-5 items-center rounded-full bg-blue-50 px-2 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            View
                          </Link>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-slate-800 w-full text-center">
                          -
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50/80 p-3.5">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Last follow-up
                    </p>
                    <p
                      className={`mt-1 truncate text-sm font-semibold text-slate-800${
                        !lastFollowUpItem ? " w-full text-center" : ""
                      }`}
                    >
                      {lastFollowUpItem
                        ? dateFmt.format(new Date(lastFollowUpItem.scheduledAt))
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50/80 p-3.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Address
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">
                      {business.address ||
                        (business.city
                          ? business.city
                          : "Location not available")}
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
                .filter(
                  (tab: any) => tab.id !== "activity-log" && tab.id !== "Notes"
                )
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
              <BusinessDetailsContacts business={business} />
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
