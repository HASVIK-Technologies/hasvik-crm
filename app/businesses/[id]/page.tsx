import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import businessData from "@/data/businessData.json"; // Adjust path if needed

// Combined all icon imports into a single statement
import { 
  ArrowLeft, Edit2, Plus, MoreVertical, 
  Phone, MessageCircle, MapPin, 
  User, Building2, Target, Store, Users, FolderOpen, Calendar,
  Tags, Building, Zap, FileText, Globe, Mail 
} from "lucide-react";

export default function BusinessDetails() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Businesses
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-[#004c9a]">
            <Edit2 className="mr-2 h-4 w-4" /> Edit Business
          </Button>
          <Button className="bg-emerald-600 hover:bg-[#71c554] text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Follow-Up
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2. Cards Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* === LEFT CARD === */}
        <Card>
          {/* Top Section: Avatar & Titles */}
          <CardHeader className="flex flex-row items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-50 text-blue-700 text-xl font-semibold">HT</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">Hasvik Technology</CardTitle>
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">Active</Badge>
              </div>
              <Badge variant="secondary" className="w-fit bg-blue-50 text-blue-700 hover:bg-blue-50">
                Furniture Shop
              </Badge>
            </div>
          </CardHeader>

          {/* Middle Section: Contact Info Text */}
          <CardContent>
            <div className="flex flex-wrap justify-between text-sm text-gray-600 gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> 9876543210
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <MessageCircle className="h-4 w-4" /> 9876543210
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Ballia, U.P.
              </div>
            </div>
          </CardContent>

          {/* Bottom Section: Action Buttons */}
          <CardFooter className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="text-emerald-600 border-gray-200">
              <Phone className="mr-2 h-4 w-4" /> Call
            </Button>
            <Button variant="outline" className="text-emerald-600 border-gray-200">
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" className="text-blue-600 border-gray-200">
              <MapPin className="mr-2 h-4 w-4" /> Directions
            </Button>
          </CardFooter>
        </Card>

        {/* === RIGHT CARD === */}
        <Card>
          <CardContent className="p-6">
            {/* 2-Column Data Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              
              {/* Detail Item 1 */}
              <div className="flex gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Business Owner</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">Contact 1 (Owner)</p>
                </div>
              </div>
              
              {/* Detail Item 2 */}
              <div className="flex gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">Furniture Shop</p>
                </div>
              </div>

              {/* Detail Item 3 */}
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Lead Source</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">Website</p>
                </div>
              </div>

              {/* Detail Item 4 */}
              <div className="flex gap-3">
                <Store className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">Retailer</p>
                </div>
              </div>

              {/* Detail Item 5 */}
              <div className="flex gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">Amit Sharma</p>
                </div>
              </div>

              {/* Detail Item 6 (with Badge) */}
              <div className="flex gap-3">
                <FolderOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                     <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">Active</Badge>
                  </div>
                </div>
              </div>

              {/* Detail Item 7 (with inline Badge) */}
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Next Follow-up</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-medium text-sm text-gray-900">Today at 10:00 AM</p>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 py-0 h-5 text-xs">Today</Badge>
                  </div>
                </div>
              </div>

              {/* Detail Item 8 */}
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Last Follow-up</p>
                  <p className="font-medium text-sm text-gray-900 mt-0.5">25 Aug 2026 at 11:30 AM</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div> {/* <-- NOTE: The grid container closes here now! */}

      {/* 3. --- TABS SECTION --- (Now outside the grid, full width) */}
      <Tabs defaultValue="overview" className="w-full mt-8">
        
        {/* Tab Headers with custom underline styling */}
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-slate-200 rounded-none gap-6">
          {businessData.tabs.map((tab: any) => (
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
            
            {/* 1. Business Information Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Business Information</h3>
              
              <div className="space-y-5">
                {/* Name */}
                <div className="flex items-start gap-3 text-sm">
                  <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Business Name</div>
                  <div className="text-slate-700 font-medium">{businessData.businessInfo.name}</div>
                </div>

                {/* Category */}
                <div className="flex items-start gap-3 text-sm">
                  <Tags className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Category</div>
                  <div className="text-slate-700 font-medium">{businessData.businessInfo.category}</div>
                </div>

              

                {/* Address */}
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Address</div>
                  <div className="text-slate-700 font-medium leading-relaxed">{businessData.businessInfo.address}</div>
                </div>

                {/* City */}
                <div className="flex items-start gap-3 text-sm">
                  <Building className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">City</div>
                  <div className="text-slate-700 font-medium">{businessData.businessInfo.city}</div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 text-sm">
                  <Zap className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Status</div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 font-medium">
                    {businessData.businessInfo.status}
                  </Badge>
                </div>


                {/* Website */}
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Website</div>
                  <a href={businessData.businessInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                    {businessData.businessInfo.website}
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="w-32 shrink-0 text-slate-500">Email</div>
                  <a href={`mailto:${businessData.businessInfo.email}`} className="text-blue-600 hover:underline font-medium break-all">
                    {businessData.businessInfo.email}
                  </a>
                </div>
              </div>
            </div>
            
            {/* We can add the Contact Info and Quick Actions cards here later in lg:col-span-1 or lg:col-span-2! */}

          </div>
        </TabsContent>
        
        {/* Empty Tabs for now */}
        <TabsContent value="contacts">Contacts Content</TabsContent>
        <TabsContent value="follow-ups">Follow-ups Content</TabsContent>
        <TabsContent value="notes">Notes Content</TabsContent>
        <TabsContent value="activity-log">Activity Log Content</TabsContent>

      </Tabs>

    </div>
  )
}