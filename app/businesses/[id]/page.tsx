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

  // Loading state fallback before store hydrates
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
      <Card className="w-full shadow-sm border-slate-200">
        
        <CardHeader className="flex flex-row items-start gap-4 pb-2">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-50 text-blue-700 text-xl font-semibold">
              {businessData.headerInfo.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-xl">{businessData.headerInfo.name}</CardTitle>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
                {businessData.headerInfo.status}
              </Badge>
            </div>
            <Badge variant="secondary" className="w-fit bg-blue-50 text-blue-700 hover:bg-blue-50">
              {businessData.headerInfo.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {businessData.headerInfo.phones[0]}
            </div>
            <div className="flex items-center gap-2 sm:justify-center text-emerald-600">
              <WhatsAppIcon className="h-4 w-4" /> {businessData.headerInfo.phones[0]}
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <MapPin className="h-4 w-4" /> {businessData.headerInfo.location}
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

        <div className="border-t border-slate-100 mx-6"></div>
      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4">
            <div className="flex gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Business Owner</p>
                <p className="font-medium text-sm text-gray-900 mt-0.5">{businessData.detailsGrid.owner}</p>
              </div>
            </div>
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
              <Store className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="font-medium text-sm text-gray-900 mt-0.5">{businessData.detailsGrid.businessType}</p>
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
          </div>
        </CardContent>
      </Card>

      {/* 3. --- TABS SECTION --- */}
      <Tabs defaultValue="overview" className="w-full mt-8">
        
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-slate-200 rounded-none gap-6 flex-wrap">
          {businessData.tabs
            .filter((tab: any) => tab.id !== 'notes' && tab.id !== 'activity-log')
            .map((tab: any) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none px-0 py-3 text-slate-500 font-medium text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
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
                  <Store className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Business Type</div>
                  <div className="text-slate-700 font-medium">{businessData.businessInfo.businessType}</div>
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
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-medium">
                    {businessData.businessInfo.status}
                  </Badge>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Description</div>
                  <div className="text-slate-600 leading-relaxed">{businessData.businessInfo.description}</div>
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

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="justify-start text-emerald-600"><Calendar className="w-4 h-4 mr-3" /> Add Follow-up</Button>
                  <Button variant="outline" className="justify-start text-blue-600"><Edit2 className="w-4 h-4 mr-3" /> Edit Business</Button>
                  <Button variant="outline" className="justify-start text-amber-500"><FileText className="w-4 h-4 mr-3" /> Add Note</Button>
                  <Button variant="outline" className="justify-start text-emerald-600"><Phone className="w-4 h-4 mr-3" /> Call Business</Button>
                  <Button variant="outline" className="justify-start text-emerald-600"><WhatsAppIcon className="w-4 h-4 mr-3" /> WhatsApp Business</Button>
                  <Button variant="outline" className="justify-start text-red-500 bg-red-50 hover:bg-red-100 border-red-200"><Slash className="w-4 h-4 mr-3" /> Deactivate Business</Button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Location</h3>
                <div className="bg-slate-100 rounded-lg h-32 mb-4 relative overflow-hidden flex items-center justify-center border border-slate-200">
                  <MapPin className="text-red-500 w-8 h-8 absolute z-10" />
                  <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Ballia&zoom=13&size=400x200&sensor=false')] bg-cover bg-center"></div>
                  <div className="absolute right-2 top-2 bg-white p-2 rounded shadow-sm border border-slate-100 text-xs font-medium w-44 z-10 text-slate-700 leading-snug">
                    {businessData.businessInfo.address}
                  </div>
                </div>
                <Button variant="secondary" className="w-full text-blue-600 bg-blue-50 hover:bg-blue-100"><ExternalLink className="w-4 h-4 mr-2" /> Open in Maps</Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* CONTACTS TAB (Now Horizontal) */}
        <TabsContent value="contacts" className="mt-6">
          {/* STEP 1: Changed max-w-xl to w-full so the card spans the full screen width */}
          <div className="w-full">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Contact Information</h3>
              
              {/* STEP 2: Added this grid wrapper to put the 3 lists side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Phone List */}
                {/* STEP 3: Removed mb-6 spacing since the grid gap handles it now */}
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
                        <a href={`https://wa.me/${cleanNumber(wa.number)}`} target="_blank" rel="noopener noreferrer">
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
        </TabsContent>

        {/* FOLLOW-UPS TAB */}
        <TabsContent value="follow-ups" className="mt-6">
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
                          <a href={`https://wa.me/${cleanNumber(item.phone)}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="w-4 h-4 text-emerald-600 hover:text-emerald-700" /></a>
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
                      <a href={`https://wa.me/${cleanNumber(item.phone)}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="w-4 h-4 text-emerald-600" /></a>
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
        </TabsContent>
        
        {/* Activity Log commented out for future use */}
        {/* 
        <TabsContent value="activity-log">
          Activity Log Content
        </TabsContent> 
        */}

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
        </>
      }
    />
  );
}