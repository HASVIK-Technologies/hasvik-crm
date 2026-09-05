"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PrimaryButton from "@/components/common/PrimaryButton";
import OutlinedButton from "@/components/common/OutlinedButton";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import businessData from "@/data/businessData.json";
import { 
  ArrowLeft, Edit2, Plus, MoreVertical, 
  Phone, MapPin, 
  User, Building2, Target, Store, Users, FolderOpen, Calendar,
  AlertCircle,
  Tags, Building, Zap, Globe, Mail 
} from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { useBusinesses } from "@/lib/business-store";
import { BusinessItem } from "@/components/businesses/types";
import { DeleteBusinessModal } from "@/components/businesses";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
  const params = useParams();
  const router = useRouter();
  const { businesses, isLoaded, deleteBusiness } = useBusinesses();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const numericId = typeof rawId === "string" ? parseInt(rawId, 10) : NaN;
  const isValidNumericId =
    !isNaN(numericId) &&
    Number.isInteger(numericId) &&
    numericId > 0 &&
    String(numericId) === String(rawId).trim();

  // For /businesses/12, always provide the static Hasvik Technology data as requested
  const business =
    numericId === 12
      ? STATIC_BUSINESS_12
      : isValidNumericId
      ? businesses.find((b) => b.id === numericId)
      : undefined;

  // If business is not found or ID is invalid
  if ((isLoaded || numericId === 12) && !business) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Business Not Found
        </h1>
        <p className="text-sm text-[#64748b]">
          The business with ID{" "}
          <span className="font-semibold text-[#0f172a]">#{rawId}</span> does not exist or has been removed.
        </p>
        <div className="pt-2">
          <OutlinedButton asChild className="gap-2">
            <Link href="/businesses">
              <ArrowLeft className="size-4" /> Back to Businesses
            </Link>
          </OutlinedButton>
        </div>
      </div>
    );
  }

  // Loading state fallback before store hydrates
  if (!business) {
    return (
      <div className="mx-auto max-w-6xl py-12 text-center text-sm text-[#64748b]">
        Loading business details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-3 md:space-y-4">
      {/* 1. Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
        <OutlinedButton asChild>
          <Link href="/businesses">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Businesses
          </Link>
        </OutlinedButton>

        <div className="flex items-center gap-2">
          <OutlinedButton className="text-primary border-gray-200">
            <Edit2 className="mr-2 h-4 w-4" /> Edit Business
          </OutlinedButton>
          <PrimaryButton>
            <Plus className="mr-2 h-4 w-4" /> Add Follow-Up
          </PrimaryButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <OutlinedButton size="icon">
                <MoreVertical className="h-4 w-4" />
              </OutlinedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-white">
              <DropdownMenuItem
                onClick={() => setShowDeleteModal(true)}
                className="cursor-pointer text-xs text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Cards Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* === LEFT CARD === */}
        <Card className="p-3 md:p-4">
          {/* Top Section: Avatar & Titles */}
          <CardHeader className="flex flex-row items-start gap-3 md:gap-4 p-0">
            <Avatar className="h-16 w-16">
              <AvatarFallback className={cn("text-xl font-semibold", business.avatarBg || "bg-blue-50", business.avatarTextColor || "text-blue-700")}>
                {business.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">{business.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-0",
                    business.status === "Active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {business.status}
                </Badge>
              </div>
              <Badge variant="secondary" className="w-fit bg-blue-50 text-blue-700 hover:bg-blue-50">
                {business.category}
              </Badge>
            </div>
          </CardHeader>

          {/* Middle Section: Contact Info Text */}
          <CardContent className="p-0 pt-3 md:pt-4">
            <div className="flex flex-wrap justify-between text-sm text-gray-600 gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> {business.phone}
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <WhatsAppIcon className="h-4 w-4" /> {business.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {business.address || `${business.city}, U.P.`}
              </div>
            </div>
          </CardContent>

          {/* Bottom Section: Action Buttons */}
          <CardFooter className="grid grid-cols-3 gap-3 p-0 pt-3 md:pt-4">
            <OutlinedButton
              asChild
              className="text-emerald-600 border-gray-200"
            >
              <a href={`tel:${business.phone}`}>
                <Phone className="mr-2 h-4 w-4" /> Call
              </a>
            </OutlinedButton>
            <OutlinedButton
              asChild
              className="text-emerald-600 border-gray-200"
            >
              <a
                href={`https://wa.me/91${business.phone}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </OutlinedButton>
            <OutlinedButton
              asChild
              className="text-blue-600 border-gray-200"
            >
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  business.name + " " + (business.address || business.city)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="mr-2 h-4 w-4" /> Directions
              </a>
            </OutlinedButton>
          </CardFooter>
        </Card>

        {/* === RIGHT CARD === */}
        <Card className="p-3 md:p-4">
          <CardContent className="p-0">
            {/* 2-Column Data Grid */}
            <div className="grid grid-cols-2 gap-y-4 md:gap-y-6 gap-x-3 md:gap-x-4">
              {/* Detail Item 1: Owner */}
              <div className="flex gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Business Owner</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">
                    {business.owner || `${business.name} Owner`}
                  </p>
                </div>
              </div>

              {/* Detail Item 2: Category */}
              <div className="flex gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">
                    {business.category}
                  </p>
                </div>
              </div>

              {/* Detail Item 3: Lead Source */}
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Lead Source</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">
                    {business.leadSource || "Website"}
                  </p>
                </div>
              </div>

              {/* Detail Item 4: Business Type */}
              <div className="flex gap-3">
                <Store className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">
                    {business.businessType || "Retailer"}
                  </p>
                </div>
              </div>

              {/* Detail Item 5: Assigned To */}
              <div className="flex gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">
                    {business.assignedTo || "Amit Sharma"}
                  </p>
                </div>
              </div>

              {/* Detail Item 6: Status */}
              <div className="flex gap-3">
                <FolderOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-0",
                        business.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {business.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Detail Item 7: Next Follow-up */}
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Next Follow-up</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-medium text-sm text-gray-900">
                      {business.nextFollowUp}
                    </p>
                    {business.nextFollowUpType === "today" && (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 py-0 h-5 text-xs">
                        Today
                      </Badge>
                    )}
                    {business.nextFollowUpType === "tomorrow" && (
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 py-0 h-5 text-xs">
                        Tomorrow
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail Item 8: Last Follow-up */}
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Last Follow-up</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">
                    {business.lastFollowUp}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. --- TABS SECTION --- (Full width) */}
      <Tabs defaultValue="overview" className="w-full mt-8">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-slate-200 rounded-none gap-6">
          {(businessData?.tabs || []).map((tab: any) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 data-[state=active]:shadow-none px-0 py-3 text-slate-500 font-medium text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Overview Tab Content */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Business Information</h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-3 text-sm">
                  <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Business Name</div>
                  <div className="text-slate-700 font-medium">{business.name || businessData.businessInfo.name}</div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <Tags className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Category</div>
                  <div className="text-slate-700 font-medium">{business.category || businessData.businessInfo.category}</div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Address</div>
                  <div className="text-slate-700 font-medium leading-relaxed">{business.address || businessData.businessInfo.address}</div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <Building className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">City</div>
                  <div className="text-slate-700 font-medium">{business.city || businessData.businessInfo.city}</div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Zap className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Status</div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 font-medium">
                    {business.status || businessData.businessInfo.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Website</div>
                  <a href={business.website || businessData.businessInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                    {business.website || businessData.businessInfo.website}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Email</div>
                  <a href={`mailto:${business.email || businessData.businessInfo.email}`} className="text-blue-600 hover:underline font-medium break-all">
                    {business.email || businessData.businessInfo.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contacts">Contacts Content</TabsContent>
        <TabsContent value="follow-ups">Follow-ups Content</TabsContent>
        <TabsContent value="notes">Notes Content</TabsContent>
        <TabsContent value="activity-log">Activity Log Content</TabsContent>
      </Tabs>

      <DeleteBusinessModal
        isOpen={showDeleteModal}
        businessName={business?.name}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (business) {
            deleteBusiness(business.id);
            setShowDeleteModal(false);
            router.push("/businesses");
          }
        }}
      />
    </div>
  );
}