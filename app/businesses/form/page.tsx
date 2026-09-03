"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Building2, Phone, MapPin, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBusinesses } from "@/lib/business-store";

export default function BusinessFormPage() {
  const router = useRouter();
  const { createBusiness, getNextBusinessId } = useBusinesses();

  const nextNumericId = getNextBusinessId();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    category: "Furniture Shop",
    city: "Ballia",
    status: "Active" as "Active" | "Inactive",
    owner: "",
    address: "",
    email: "",
    website: "",
    leadSource: "Website",
    businessType: "Retailer",
    assignedTo: "Amit Sharma",
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Business Name is required.");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Phone Number is required.");
      return;
    }

    // Automatically assigns the next unique numeric ID in the persistent store
    const created = createBusiness({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      category: formData.category,
      city: formData.city,
      status: formData.status,
      owner: formData.owner.trim() || `${formData.name.trim()} Owner`,
      address: formData.address.trim() || `${formData.city}, Uttar Pradesh`,
      email: formData.email.trim() || undefined,
      website: formData.website.trim() || undefined,
      leadSource: formData.leadSource,
      businessType: formData.businessType,
      assignedTo: formData.assignedTo,
    });

    // Navigate to the newly created business using its actual unique numeric ID
    router.push(`/businesses/${created.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/businesses">
              <ArrowLeft className="mr-1.5 size-4" /> Back to Businesses
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl">
            Add New Business
          </h1>
        </div>

        <Badge variant="outline" className="border-[#0b63e5] bg-[#eff8ff] px-3 py-1 font-mono text-xs font-semibold text-[#0b63e5]">
          Auto-Assigned ID: #{nextNumericId}
        </Badge>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form Card */}
      <Card className="rounded-2xl border border-[#e4ecf2] bg-white p-4 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Core Business Info */}
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-[#0f172a]">
              <Building2 className="size-4.5 text-[#0b63e5]" />
              Business Information
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Balaji Hardware"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Furniture Shop">Furniture Shop</SelectItem>
                    <SelectItem value="Hardware Store">Hardware Store</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Electrical Shop">Electrical Shop</SelectItem>
                    <SelectItem value="Kirana Store">Kirana Store</SelectItem>
                    <SelectItem value="Service Center">Service Center</SelectItem>
                    <SelectItem value="Medical Store">Medical Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  City <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.city}
                  onValueChange={(val) => setFormData({ ...formData, city: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Ballia">Ballia</SelectItem>
                    <SelectItem value="Buxar">Buxar</SelectItem>
                    <SelectItem value="Ghazipur">Ghazipur</SelectItem>
                    <SelectItem value="Varanasi">Varanasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(val: "Active" | "Inactive") => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <hr className="border-[#f1f5f9]" />

          {/* Section 2: Contact Details */}
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-[#0f172a]">
              <Phone className="size-4.5 text-[#16a34a]" />
              Contact Information
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Phone / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Business Owner
                </label>
                <Input
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#334155]">
                  Full Address
                </label>
                <Input
                  placeholder="e.g. Near Station Road, Ballia, Uttar Pradesh - 277001"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="e.g. info@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Website
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#f1f5f9]" />

          {/* Section 3: Lead & Assignment */}
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-[#0f172a]">
              <User className="size-4.5 text-[#7f56d9]" />
              Assignment & Source
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Lead Source
                </label>
                <Select
                  value={formData.leadSource}
                  onValueChange={(val) => setFormData({ ...formData, leadSource: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Direct Call">Direct Call</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Business Type
                </label>
                <Select
                  value={formData.businessType}
                  onValueChange={(val) => setFormData({ ...formData, businessType: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Retailer">Retailer</SelectItem>
                    <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                    <SelectItem value="Distributor">Distributor</SelectItem>
                    <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Assigned To
                </label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(val) => setFormData({ ...formData, assignedTo: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Amit Sharma">Amit Sharma</SelectItem>
                    <SelectItem value="Priya Singh">Priya Singh</SelectItem>
                    <SelectItem value="Rahul Verma">Rahul Verma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f5f9]">
            <Button
              asChild
              type="button"
              variant="outline"
              className="rounded-xl"
            >
              <Link href="/businesses">Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="gap-2 rounded-xl bg-[#0b63e5] px-6 font-semibold text-white hover:bg-[#0952be]"
            >
              <Save className="size-4" />
              Save Business (Assign ID #{nextNumericId})
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}