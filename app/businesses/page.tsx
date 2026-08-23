"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  CalendarCheck2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
  ArrowRight,
} from "lucide-react";

// Official SVG WhatsApp Icon Component
function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

interface BusinessItem {
  id: string;
  name: string;
  phone: string;
  initials: string;
  avatarBg: string;
  avatarTextColor: string;
  category: string;
  city: string;
  status: "Active" | "Inactive";
  lastFollowUp: string;
  nextFollowUp: string;
  nextFollowUpType: "today" | "tomorrow" | "date" | "none";
}

const BUSINESS_DATA: BusinessItem[] = [
  {
    id: "1",
    name: "Shree Balaji Traders",
    phone: "9876543210",
    initials: "SB",
    avatarBg: "bg-[#fee4e2]",
    avatarTextColor: "text-[#d92d20]",
    category: "Furniture Shop",
    city: "Ballia",
    status: "Active",
    lastFollowUp: "Today at 10:00 AM",
    nextFollowUp: "Today",
    nextFollowUpType: "today",
  },
  {
    id: "2",
    name: "Maa Durga Enterprises",
    phone: "9123456780",
    initials: "MD",
    avatarBg: "bg-[#d1fadf]",
    avatarTextColor: "text-[#039855]",
    category: "Hardware Store",
    city: "Buxar",
    status: "Active",
    lastFollowUp: "Today at 11:30 AM",
    nextFollowUp: "Today",
    nextFollowUpType: "today",
  },
  {
    id: "3",
    name: "Akash Furniture",
    phone: "9988776655",
    initials: "AF",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: "Furniture Shop",
    city: "Ghazipur",
    status: "Active",
    lastFollowUp: "Tomorrow 10:00 AM",
    nextFollowUp: "Tomorrow",
    nextFollowUpType: "tomorrow",
  },
  {
    id: "4",
    name: "Gupta Construction",
    phone: "8877665544",
    initials: "GC",
    avatarBg: "bg-[#fef0c7]",
    avatarTextColor: "text-[#dc6803]",
    category: "Construction",
    city: "Varanasi",
    status: "Active",
    lastFollowUp: "25 May 2024",
    nextFollowUp: "25 May 2024",
    nextFollowUpType: "date",
  },
  {
    id: "5",
    name: "Star Enterprises",
    phone: "7766554433",
    initials: "SE",
    avatarBg: "bg-[#f4ebff]",
    avatarTextColor: "text-[#7f56d9]",
    category: "Electrical Shop",
    city: "Ballia",
    status: "Inactive",
    lastFollowUp: "20 May 2024",
    nextFollowUp: "-",
    nextFollowUpType: "none",
  },
  {
    id: "6",
    name: "Rakesh Kirana Store",
    phone: "9988774433",
    initials: "RK",
    avatarBg: "bg-[#d1fadf]",
    avatarTextColor: "text-[#039855]",
    category: "Kirana Store",
    city: "Ballia",
    status: "Active",
    lastFollowUp: "24 May 2024",
    nextFollowUp: "26 May 2024",
    nextFollowUpType: "date",
  },
  {
    id: "7",
    name: "Vishal Services",
    phone: "8899776655",
    initials: "VS",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: "Service Center",
    city: "Buxar",
    status: "Active",
    lastFollowUp: "23 May 2024",
    nextFollowUp: "25 May 2024",
    nextFollowUpType: "date",
  },
  {
    id: "8",
    name: "Prakash Pharmacy",
    phone: "7788996655",
    initials: "PK",
    avatarBg: "bg-[#fef0c7]",
    avatarTextColor: "text-[#dc6803]",
    category: "Medical Store",
    city: "Ghazipur",
    status: "Inactive",
    lastFollowUp: "15 May 2024",
    nextFollowUp: "-",
    nextFollowUpType: "none",
  },
];

export default function BusinessesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [sortOrder, setSortOrder] = useState("Latest First");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("10 per page");

  const filteredData = useMemo(() => {
    return BUSINESS_DATA.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" || item.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "All Status" || item.status === selectedStatus;
      const matchesCity =
        selectedCity === "All Cities" || item.city === selectedCity;

      return matchesSearch && matchesCategory && matchesStatus && matchesCity;
    });
  }, [searchTerm, selectedCategory, selectedStatus, selectedCity]);

  return (
    <div className="space-y-6 pb-12">
      {/* 4 Summary / Metric KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Businesses */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e4ecf2] bg-white p-6 shadow-[0_2px_12px_rgba(20,40,60,0.03)] transition-all hover:shadow-[0_4px_18px_rgba(20,40,60,0.06)]">
          <div className="flex items-start gap-4">
            <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-[#e0effe] text-[#2563eb]">
              <Building2 className="size-6.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#64748b]">Total Businesses</p>
              <h3 className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a]">156</h3>
            </div>
          </div>
          <div className="mt-6 border-t border-[#f1f5f9] pt-3.5">
            <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] transition-colors hover:text-[#1d4ed8]">
              View all businesses
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Active Businesses */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e4ecf2] bg-white p-6 shadow-[0_2px_12px_rgba(20,40,60,0.03)] transition-all hover:shadow-[0_4px_18px_rgba(20,40,60,0.06)]">
          <div className="flex items-start gap-4">
            <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-[#dcfce7] text-[#16a34a]">
              <Building2 className="size-6.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#64748b]">Active Businesses</p>
              <h3 className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a]">128</h3>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[#f1f5f9] pt-3.5">
            <span className="text-sm font-semibold text-[#16a34a]">82.1% of total</span>
            <div className="h-7 w-28">
              <svg viewBox="0 0 110 28" className="h-full w-full overflow-visible" fill="none">
                <path
                  d="M0 24 C 20 24, 30 18, 50 14 C 70 10, 80 16, 95 6 C 102 2, 107 4, 110 2"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 24 C 20 24, 30 18, 50 14 C 70 10, 80 16, 95 6 C 102 2, 107 4, 110 2 L 110 28 L 0 28 Z"
                  fill="url(#greenGrad2)"
                  opacity="0.28"
                />
                <defs>
                  <linearGradient id="greenGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Follow-up Today */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e4ecf2] bg-white p-6 shadow-[0_2px_12px_rgba(20,40,60,0.03)] transition-all hover:shadow-[0_4px_18px_rgba(20,40,60,0.06)]">
          <div className="flex items-start gap-4">
            <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706]">
              <CalendarCheck2 className="size-6.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#64748b]">Follow-up Today</p>
              <h3 className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a]">18</h3>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[#f1f5f9] pt-3.5">
            <span className="text-sm font-medium text-[#64748b]">Needs attention</span>
            <div className="h-7 w-28">
              <svg viewBox="0 0 110 28" className="h-full w-full overflow-visible" fill="none">
                <path
                  d="M0 24 C 25 24, 40 22, 60 16 C 80 10, 95 12, 110 4"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 24 C 25 24, 40 22, 60 16 C 80 10, 95 12, 110 4 L 110 28 L 0 28 Z"
                  fill="url(#amberGrad2)"
                  opacity="0.28"
                />
                <defs>
                  <linearGradient id="amberGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Categories */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e4ecf2] bg-white p-6 shadow-[0_2px_12px_rgba(20,40,60,0.03)] transition-all hover:shadow-[0_4px_18px_rgba(20,40,60,0.06)]">
          <div className="flex items-start gap-4">
            <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#9333ea]">
              <Tag className="size-6.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#64748b]">Categories</p>
              <h3 className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a]">24</h3>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[#f1f5f9] pt-3.5">
            <span className="text-sm font-medium text-[#64748b]">Business categories</span>
            <div className="h-7 w-28">
              <svg viewBox="0 0 110 28" className="h-full w-full overflow-visible" fill="none">
                <path
                  d="M0 22 C 20 25, 45 16, 70 18 C 88 20, 98 10, 110 6"
                  stroke="#9333ea"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 22 C 20 25, 45 16, 70 18 C 88 20, 98 10, 110 6 L 110 28 L 0 28 Z"
                  fill="url(#purpleGrad2)"
                  opacity="0.28"
                />
                <defs>
                  <linearGradient id="purpleGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-[#e4ecf2] bg-white p-4 shadow-[0_2px_12px_rgba(20,40,60,0.03)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3.5">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#e2e8f0] bg-white pl-4.5 pr-11 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0b63e5] focus:outline-none focus:ring-1 focus:ring-[#0b63e5]"
            />
            <Search className="pointer-events-none absolute right-4 top-1/2 size-4.5 -translate-y-1/2 text-[#94a3b8]" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 appearance-none rounded-xl border border-[#e2e8f0] bg-white pl-4 pr-10 text-sm font-medium text-[#334155] hover:border-[#cbd5e1] focus:border-[#0b63e5] focus:outline-none"
            >
              <option>All Categories</option>
              <option>Furniture Shop</option>
              <option>Hardware Store</option>
              <option>Construction</option>
              <option>Electrical Shop</option>
              <option>Kirana Store</option>
              <option>Service Center</option>
              <option>Medical Store</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-11 appearance-none rounded-xl border border-[#e2e8f0] bg-white pl-4 pr-10 text-sm font-medium text-[#334155] hover:border-[#cbd5e1] focus:border-[#0b63e5] focus:outline-none"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
          </div>

          {/* Cities Filter */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-11 appearance-none rounded-xl border border-[#e2e8f0] bg-white pl-4 pr-10 text-sm font-medium text-[#334155] hover:border-[#cbd5e1] focus:border-[#0b63e5] focus:outline-none"
            >
              <option>All Cities</option>
              <option>Ballia</option>
              <option>Buxar</option>
              <option>Ghazipur</option>
              <option>Varanasi</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
          </div>
        </div>

        {/* Add Business Button in Royal Blue */}
        <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b63e5] px-5.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(11,99,229,0.28)] transition-all hover:bg-[#0952be]">
          <Plus className="size-4.5 stroke-[2.5]" />
          Add Business
        </button>
      </div>

      {/* Main Table Container Card */}
      <div className="overflow-hidden rounded-2xl border border-[#e4ecf2] bg-white shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
        {/* Table Card Top Bar */}
        <div className="flex flex-col gap-3.5 border-b border-[#f1f5f9] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[#0f172a]">
            Businesses <span className="font-medium text-[#64748b]">({filteredData.length})</span>
          </h2>

          <div className="flex items-center gap-3">
            <button className="flex h-10 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc]">
              <Download className="size-4 text-[#64748b]" />
              Export
            </button>

            <div className="relative">
              <button className="flex h-10 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc]">
                <SlidersHorizontal className="size-4 text-[#64748b]" />
                <span>{sortOrder}</span>
                <ChevronDown className="size-4 text-[#64748b]" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#f8fafc] text-[13px] font-semibold text-[#475569]">
              <tr className="border-b border-[#f1f5f9]">
                <th className="py-4 pl-6 pr-4">Business Name</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">City</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Last Follow-up</th>
                <th className="px-4 py-4">Next Follow-up</th>
                <th className="py-4 pl-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[#f8fafc]/80"
                >
                  {/* Business Name + Avatar + Phone */}
                  <td className="py-4.5 pl-6 pr-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex size-10.5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.avatarBg} ${item.avatarTextColor}`}
                      >
                        {item.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">{item.name}</p>
                        <p className="mt-0.5 text-xs text-[#64748b]">{item.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4.5 text-sm text-[#475569]">{item.category}</td>

                  {/* City */}
                  <td className="px-4 py-4.5 text-sm text-[#475569]">{item.city}</td>

                  {/* Status */}
                  <td className="px-4 py-4.5">
                    {item.status === "Active" ? (
                      <span className="inline-flex items-center rounded-md bg-[#ecfdf3] px-3 py-1 text-xs font-semibold text-[#027a48]">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#667085]">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Last Follow-up */}
                  <td className="px-4 py-4.5 text-sm text-[#475569]">{item.lastFollowUp}</td>

                  {/* Next Follow-up */}
                  <td className="px-4 py-4.5">
                    {item.nextFollowUpType === "today" ? (
                      <span className="inline-flex items-center rounded-md bg-[#ecfdf3] px-3 py-1 text-xs font-semibold text-[#027a48]">
                        Today
                      </span>
                    ) : item.nextFollowUpType === "tomorrow" ? (
                      <span className="inline-flex items-center rounded-md bg-[#eff8ff] px-3 py-1 text-xs font-semibold text-[#175cd3]">
                        Tomorrow
                      </span>
                    ) : item.nextFollowUpType === "date" ? (
                      <span className="inline-flex items-center rounded-md bg-[#eff8ff] px-3 py-1 text-xs font-semibold text-[#175cd3]">
                        {item.nextFollowUp}
                      </span>
                    ) : (
                      <span className="text-[#94a3b8]">-</span>
                    )}
                  </td>

                  {/* Actions (Call, WhatsApp, 3 dots) */}
                  <td className="py-4.5 pl-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      {/* Phone Call */}
                      <a
                        href={`tel:${item.phone}`}
                        title={`Call ${item.name}`}
                        className="flex size-8.5 items-center justify-center rounded-lg text-[#059669] transition-colors hover:bg-[#ecfdf3]"
                      >
                        <Phone className="size-4.5" />
                      </a>

                      {/* Official WhatsApp */}
                      <a
                        href={`https://wa.me/91${item.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`WhatsApp ${item.name}`}
                        className="flex size-8.5 items-center justify-center rounded-lg text-[#16a34a] transition-colors hover:bg-[#ecfdf3]"
                      >
                        <WhatsAppIcon className="size-4.5" />
                      </a>

                      {/* 3 Dots Menu */}
                      <button
                        title="More Actions"
                        className="flex size-8.5 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#334155]"
                      >
                        <MoreVertical className="size-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-4 border-t border-[#f1f5f9] px-6 py-4.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#64748b]">
            Showing <span className="font-semibold text-[#0f172a]">1</span> to{" "}
            <span className="font-semibold text-[#0f172a]">10</span> of{" "}
            <span className="font-semibold text-[#0f172a]">156</span> results
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="flex size-8.5 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#cbd5e1] transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button className="flex size-8.5 items-center justify-center rounded-lg bg-[#0b63e5] text-sm font-semibold text-white shadow-sm">
                1
              </button>
              <button className="flex size-8.5 items-center justify-center rounded-lg border border-[#e2e8f0] text-sm font-medium text-[#64748b] hover:bg-[#f8fafc]">
                2
              </button>
              <button className="flex size-8.5 items-center justify-center rounded-lg border border-[#e2e8f0] text-sm font-medium text-[#64748b] hover:bg-[#f8fafc]">
                3
              </button>
              <button className="flex size-8.5 items-center justify-center rounded-lg border border-[#e2e8f0] text-sm font-medium text-[#64748b] hover:bg-[#f8fafc]">
                4
              </button>
              <button className="flex size-8.5 items-center justify-center rounded-lg border border-[#e2e8f0] text-sm font-medium text-[#64748b] hover:bg-[#f8fafc]">
                5
              </button>
              <button className="flex size-8.5 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]">
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(e.target.value)}
                className="h-8.5 appearance-none rounded-lg border border-[#e2e8f0] bg-white pl-3.5 pr-8 text-xs font-medium text-[#334155] hover:border-[#cbd5e1] focus:outline-none"
              >
                <option>10 per page</option>
                <option>25 per page</option>
                <option>50 per page</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#64748b]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
