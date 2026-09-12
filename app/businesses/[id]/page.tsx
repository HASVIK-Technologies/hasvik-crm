"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import OutlinedButton from "@/components/common/OutlinedButton";
import Actions from "@/components/common/Actions";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import businessData from "@/data/businessData.json";
import BusinessDetailsMap from "../../../components/business-details/BusinessDetailsMap";
import BusinessDetailsOverview from "../../../components/business-details/BusinessDetailsOverview";
import BusinessDetailsQuickActions from "../../../components/business-details/BusinessDetailsQuickActions";
import PhoneButton from "../../../components/business-details/business-details-header/PhoneButton";
import BusinessDetailsContacts from "../../../components/business-details/BusinessDetailsContacts";
import BusinessDetailsFollowups from "../../../components/business-details/BusinessDetailsFollowups";
import { 
  Edit2, Plus, MoreVertical, 
  Phone, MapPin, 
  User, Building2, Target, Store, Users, FolderOpen, Calendar,
  AlertCircle,
  Tags, Building, Zap, Globe, Mail, Trash2, Slash, ExternalLink,
  FileText
} from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { useBusinesses } from "@/lib/business-store";
import { BusinessItem } from "@/components/businesses/types";
import { DeleteBusinessModal } from "@/components/businesses";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  
  const cleanNumber = (num: string) => num.replace(/\D/g, '');

  const params = useParams();
  const router = useRouter();
  const { businesses, isLoaded, deleteBusiness } = useBusinesses();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = React.useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = React.useState(false);
  const [followUpDate, setFollowUpDate] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [reminder, setReminder] = React.useState("");

  const submitFollowUpToApi = async () => {
    if (!followUpDate || assignedTo === "Select Assignee..." || reminder === "Select Reminder...") {
      alert("Please fill out all fields before adding!");
      return; 
    }
    try {
      // We use rawId here so it automatically uses the ID from the URL (like 6aa6553d6a0547b6ab75072d)
      const response = await fetch(`http://localhost:3000/businesses/${rawId}`, {
        method: "PATCH", // Change this to "POST" or "PUT" depending on what your backend developer requires
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nextFollowupDate: followUpDate,
          assignedTo: assignedTo,
          reminder: reminder
        }),
      });
  
      if (response.ok) {
        alert("Success! The Follow Up is added!");
        setShowFollowUpModal(false); // Close the modal
      } else {
        alert("Failed to Add.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Something went wrong with the network.");
    }
  };
  

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const numericId = typeof rawId === "string" ? parseInt(rawId, 10) : NaN;
  const isValidNumericId =
    !isNaN(numericId) &&
    Number.isInteger(numericId) &&
    numericId > 0 &&
    String(numericId) === String(rawId).trim();

  const business =
    numericId === 12
      ? STATIC_BUSINESS_12
      : isValidNumericId
      ? businesses.find((b) => b.id === numericId)
      : undefined;

  if (!business) {
    return (
      <div className="mx-auto max-w-6xl py-12 text-center text-sm text-[#64748b]">
        Loading business details...
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
            },
            {
              label: "Delete",
              onSelect: () => setShowDeleteModal(true),
              destructive: true,
            },
          ]}
        />
      }
      content={
        <>

      {/* 2. SINGLE MERGED CARD (Full Width) */}
      <Card className="w-full overflow-hidden rounded-2xl border-[#e4ecf2] shadow-[0_4px_20px_rgba(20,40,60,0.04)]">
        <div className="border-t border-slate-100 mx-6"></div>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4">
            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium text-sm text-gray-900 mt-0.5">{businessData.detailsGrid.category}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Target className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Lead Source</p>
                <p className="font-medium text-sm text-gray-900 mt-0.5">{businessData.detailsGrid.leadSource}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-medium text-sm text-gray-900 mt-0.5">{businessData.detailsGrid.assignedTo}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <FolderOpen className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">
                   <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">{businessData.detailsGrid.status}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Next Follow-up</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-medium text-sm text-gray-900">{businessData.detailsGrid.nextFollowUp}</p>
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 py-0 h-5 text-xs">{businessData.detailsGrid.nextFollowUpBadge}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Last Follow-up</p>
                <p className="font-medium text-sm text-gray-900 mt-0.5">{businessData.detailsGrid.lastFollowUp}</p>
              </div>
            </div>

            <div className ="flex gap-3">
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
            .filter((tab: any) =>  tab.id !== 'activity-log')
            .filter((tab: any) =>  tab.id !== 'activity-log')
            .map((tab: any) => (
              <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex-none !px-0 py-2 !bg-transparent !shadow-none border-0 border-b-2 border-transparent rounded-none text-slate-500 font-medium text-base data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 outline-none focus-visible:ring-0"
              className="flex-none !px-0 py-2 !bg-transparent !shadow-none border-0 border-b-2 border-transparent rounded-none text-slate-500 font-medium text-base data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 outline-none focus-visible:ring-0"
            >
              {tab.label}
              {tab.id === 'contacts' && ` (${businessData.contactInfo.phones.length + businessData.contactInfo.whatsapps.length})`}
              {tab.id === 'follow-ups' && ` (${businessData.recentFollowUps.length})`}
              {tab.id === 'notes' && ` (2)`}
              {tab.id === 'contacts' && ` (${businessData.contactInfo.phones.length + businessData.contactInfo.whatsapps.length})`}
              {tab.id === 'follow-ups' && ` (${businessData.recentFollowUps.length})`}
              {tab.id === 'notes' && ` (2)`}
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
            setShowFollowUpModal={setShowFollowUpModal}
            setShowDeactivateModal={setShowDeactivateModal}
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
        {/* NOTES TAB */}
        <TabsContent value="notes" className="mt-6">
          
        </TabsContent>
        {/* NOTES TAB */}
        <TabsContent value="notes" className="mt-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Notes</h3>
            <p className="text-gray-500 text-sm">You can build your notes section here!</p>
          </div>
        </TabsContent>
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
      {/* New Follow-up Modal */}
      {showFollowUpModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">New Follow Up</h2>
        <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Business Name (Disabled) */}
        <div>
          <label className="text-xs font-semibold text-slate-500 camelcase tracking-wider">Business Name</label>
          <input 
            type="text" 
            disabled 
            value={business.name} 
            className="w-full mt-1.5 p-2.5 text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" 
          />
        </div>

          {/* Date Picker */}
        <div>
          <label className="text-xs font-semibold text-slate-500 camelcase tracking-wider">Next Follow Up Date</label>
            <div className="relative mt-1.5">
              <input 
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)} 
                className="w-full p-2.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-transparent relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:right-0" 
              />
              {/* The Custom Calendar Icon */}
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-0" />
            </div>
        </div>

        {/* Assigned To Dropdown */}
        <div>
          <label className="text-xs font-semibold text-slate-500 camelcase tracking-wider">Assigned To</label>
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full mt-1.5 p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white">
            <option>Select Assignee...</option>
            <option>Amit Sharma</option>
            <option>Annu Singh</option>
            <option>Aakriti Singh</option>
          </select>
        </div>
        {/* Reminder Dropdown */}
        <div>
          <label className="text-xs font-semibold text-slate-500 camelcase tracking-wider">Reminder</label>
          <select value={reminder} onChange={(e) => setReminder(e.target.value)} className="w-full mt-1.5 p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white">
            <option>Select Reminder...</option>
            <option>Before 15 Minutes</option>
            <option>Before 30 Minutes</option>
            <option>Before 1 Hour</option>
            <option>At 9:00 AM</option>
            <option>At 9:30 AM</option>
            <option>At 10:00 AM</option>
            <option>At 10:30 AM</option>
            <option>At 11:00 AM</option>
            <option>At 11:30 AM</option>
            <option>At 12:00 PM</option>
            <option>At 12:30 PM</option>
            <option>At 01:00 PM</option>
            <option>At 01:30 PM</option>
            <option>At 02:00 PM</option>
            <option>At 02:30 PM</option>
            <option>At 03:00 PM</option>
            <option>At 03:30 PM</option>
            <option>At 04:00 PM</option>
            <option>At 04:30 PM</option>
            <option>At 05:00 PM</option>
            <option>At 05:30 PM</option>
            <option>At 06:00 PM</option>
            <option>At 06:30 PM</option>
            <option>At 07:0 PM</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between gap-3 mt-8">
        <button 
          onClick={() => setShowFollowUpModal(false)}
          className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={submitFollowUpToApi}
          className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
        >
        Schedule
        </button>
      </div>
    </div>
  </div>
)}
        {/* Deactivate Business Modal */}
        {showDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-center">
      
        {/* Red Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Slash className="h-6 w-6 text-red-600" />
          </div>

        {/* Text */}
        <h3 className="text-lg font-bold text-slate-900 mb-2">Deactivate Business</h3>
        <p className="text-sm text-slate-500 mb-6">
          Are you sure you want to deactivate <span className="font-semibold text-slate-700">{business.name}</span>?
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => setShowDeactivateModal(false)}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors w-full"
          >
            No
          </button>
          <button 
            onClick={() => {
              alert("Ready for the API in the next step!"); 
              setShowDeactivateModal(false);
            }}
            className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors w-full"
          >
            Yes
          </button>
        </div>
    </div>
  </div>
)}
  </>
  }
  />
);
}