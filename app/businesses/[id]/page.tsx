"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import OutlinedButton from "@/components/common/OutlinedButton";
import Actions from "@/components/common/Actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import businessData from "@/data/businessData.json";
import BusinessDetailsMap from "../../../components/business-details/BusinessDetailsMap";
import BusinessDetailsOverview from "../../../components/business-details/BusinessDetailsOverview";
import BusinessDetailsQuickActions from "../../../components/business-details/BusinessDetailsQuickActions";
// import PhoneButton from "../../../components/business-details/business-details-header/PhoneButton";
import BusinessDetailsContacts from "../../../components/business-details/BusinessDetailsContacts";
import { AddFollowUpModal } from "@/components/business-details/AddFollowUpModal";


import {
  Edit2,
  Plus,
  MoreVertical,
  ArrowLeft,
  Phone,
  MapPin,
  Building2,
  Target,
  Users,
  FolderOpen,
  Calendar,
  AlertCircle,
  Tags,
  Building,
  Zap,
  Globe,
  Mail,
  Trash2,
  Slash,
  ExternalLink,
  FileText,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import {
  useBusinessQuery,
  useUpdateBusinessStatus,
} from "@/hooks/use-businesses";
import { BusinessItem } from "@/types/business";
import { ChangeBusinessStatusModal } from "@/components/businesses";
import { Button } from "@/components/ui/button";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
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
  avatarBg: "bg-blue-50",
  avatarTextColor: "text-blue-700",
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
  const [followUpDate, setFollowUpDate] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [reminder, setReminder] = React.useState("");

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const {
    data: apiBusiness,
    isError,
    isLoading,
  } = useBusinessQuery(typeof rawId === "string" ? rawId : undefined);
  const numericId = typeof rawId === "string" ? parseInt(rawId, 10) : NaN;
  // For /businesses/12, always provide the static Hasvik Technology data as requested
  const business =
    apiBusiness ?? (numericId === 12 ? STATIC_BUSINESS_12 : undefined);

  // If business is not found or ID is invalid
  // if ((isLoaded || numericId === 12) && !business) {
  //   return (
  //     <div className="mx-auto max-w-xl py-16 text-center space-y-4">
  //       <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
  //         <AlertCircle className="size-7" />
  //       </div>
  //       <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
  //         Business Not Found
  //       </h1>
  //       <p className="text-sm text-[#64748b]">
  //         The business with ID{" "}
  //         <span className="font-semibold text-[#0f172a]">#{rawId}</span> does not exist or has been removed.
  //       </p>
  //       <div className="pt-2">
  //         <OutlinedButton asChild className="gap-2">
  //           <Link href="/businesses">
  //             <ArrowLeft className="size-4" /> Back to Businesses
  //           </Link>
  //         </OutlinedButton>
  //       </div>
  //     </div>
  //   );
  // }

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
            label: "Add Follow-Up",
            icon: <Plus className="size-4" />,
          }}
          secondary={[
            {
              label: "Edit Business",
              icon: <Edit2 className="size-4" />,
              disabled: business?.status?.toLowerCase() !== "active",
            },
            {
              label:
                business?.status?.toLowerCase() === "active"
                  ? "Deactivate"
                  : "Activate",
            },
          ]}
        />
      }
      content={
        <>
          {/* 2. SINGLE MERGED CARD (Full Width) */}
          <Card className="w-full overflow-hidden rounded-2xl border-[#e4ecf2] shadow-[0_4px_20px_rgba(20,40,60,0.04)]">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-[#eef2f6] bg-[#fbfdff] px-5 py-5 sm:px-7">
              <div className="flex items-start gap-4">
                <Avatar className="size-16 rounded-2xl">
                  <AvatarFallback className="bg-blue-50 text-xl font-semibold text-blue-700">
                    {business.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-0.5 flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="truncate text-xl tracking-tight text-[#334155] sm:text-2xl">
                      {business.name}
                    </CardTitle>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
                      {business.status}
                    </Badge>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-[#64748b]">
                    <Building2 className="size-4 text-[#94a3b8]" />
                    {business.category}{" "}
                    <span className="text-[#cbd5e1]">/</span> {business.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {businessData.contactInfo.phones?.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <OutlinedButton className="h-9 w-9 p-0 flex items-center justify-center text-emerald-600 border-gray-200 hover:bg-emerald-50">
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
                    className="h-9 w-9 p-0 flex items-center justify-center text-emerald-600 border-gray-200 hover:bg-emerald-50"
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
                      <OutlinedButton className="h-9 w-9 p-0 flex items-center justify-center text-emerald-600 border-gray-200 hover:bg-emerald-50">
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
                    className="h-9 w-9 p-0 flex items-center justify-center text-emerald-600 border-gray-200 hover:bg-emerald-50"
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
                  className="h-9 w-9 p-0 flex items-center justify-center text-blue-600 border-gray-200 hover:bg-blue-50"
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

            <div className="border-t border-slate-100 mx-6"></div>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4">
                <div className="flex gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-sm text-gray-900 mt-0.5">
                      {business.category}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Target className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Lead Source</p>
                    <p className="font-medium text-sm text-gray-900 mt-0.5">
                      {business.leadSource || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="font-medium text-sm text-gray-900 mt-0.5">
                      {business.assignedTo || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FolderOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
                        {business.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Next Follow-up</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-medium text-sm text-gray-900">
                        {business.nextFollowUp}
                      </p>
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 py-0 h-5 text-xs">
                        {business.nextFollowUpType}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Follow-up</p>
                    <p className="font-medium text-sm text-gray-900 mt-0.5">
                      {business.lastFollowUp}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-sm text-gray-900 mt-0.5">
                      {business.address || businessData.businessInfo.address}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-sm text-gray-900 mt-0.5">
                      {business.address || businessData.businessInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. --- TABS SECTION --- */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="inline-flex h-auto p-0 bg-transparent gap-6">
              {businessData.tabs
                .filter((tab: any) => tab.id !== "activity-log" && tab.id !== "Notes")
                .map((tab: any) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-none !px-0 py-2 !bg-transparent !shadow-none border-0 border-b-2 border-transparent rounded-none text-slate-500 font-medium text-base data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 outline-none focus-visible:ring-0"
                  >
                    {tab.label}
                    {tab.id === "contacts" &&
                      ` (${businessData.contactInfo.phones.length + businessData.contactInfo.whatsapps.length})`}
                    {tab.id === "follow-ups" &&
                      ` (${businessData.recentFollowUps.length})`}
                    {/* {tab.id === "notes" && ` (2)`} */}
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
              <BusinessDetailsFollowups businessData={businessData} />
            </TabsContent>
            {/* NOTES TAB 
            <TabsContent value="notes" className="mt-6"></TabsContent> */}
            
          </Tabs>

          
          {/* New Follow-up Modal */}
          <AddFollowUpModal />
          {/* Deactivate Business Modal */}
          <DeactivateBusinessModal businessName={business.name} businessStatus={business.status} />
        </>
      }
    />
  );
}
