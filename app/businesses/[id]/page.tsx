"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import OutlinedButton from "@/components/common/OutlinedButton";
import Actions from "@/components/common/Actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActivityStateText } from "@/components/common/ActivityStateText";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BusinessDetailsMap from "../../../components/business-details/BusinessDetailsMap";
import { useBusinessFollowUpsQuery } from "@/hooks/use-business-get-follow-ups";
import { useModalStore } from "@/store/business-modal-store";
import { AddFollowUpModal } from "@/components/business-details/AddFollowUpModal";
import {
  getLocationData,
  openGoogleMapsOnce,
} from "@/lib/business/location";

import {
  Edit2,
  ArrowLeft,
  Phone,
  MapPin,
  Building2,
  Users,
  Calendar,
  AlertCircle,
  Plus,
  UserRoundCog,
  Globe,
  Mail,
  FileText,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { useBusinessQuery } from "@/hooks/use-businesses";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import RecordLink from "@/components/common/RecordLink";
import { formatLeadStatus } from "@/lib/business/form-options";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BusinessDetailsFollowups from "@/components/business-details/BusinessDetailsFollowups";
import BusinessDetailsActivity from "@/components/business-details/BusinessDetailsActivity";
import { DeactivateBusinessModal } from "@/components/business-details/DeactivateBusinessModal";
import { useBusinessListStore } from "@/store/business-list-store";
import AssignBusinessDialog from "@/components/businesses/AssignBusinessDialog";
import TagAssignmentPicker from "@/components/tags/TagAssignmentPicker";
import { normalizeHttpUrl } from "@/lib/business/url-validation";

export default function BusinessDetails() {
  const cleanNumber = (num: string) => num.replace(/\D/g, "");

  const params = useParams();
  const [isAssignmentOpen, setIsAssignmentOpen] = React.useState(false);

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const stringId = typeof rawId === "string" ? rawId : "";
  React.useEffect(() => {
    if (stringId) useBusinessListStore.getState().highlightBusiness(stringId, true);
  }, [stringId]);
  const { data: followUps } = useBusinessFollowUpsQuery(stringId);
  const {
    data: apiBusiness,
    isError,
    isLoading,
  } = useBusinessQuery(typeof rawId === "string" ? rawId : undefined);
  const business = apiBusiness;
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
        Unable to load this lead. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl py-12 text-center text-sm text-[#64748b]">
        Loading lead details...
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
          Lead not found
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#64748b]">
          The lead with ID #{rawId} does not exist or has been removed.
        </p>
        <OutlinedButton asChild className="mt-6 gap-2">
          <Link href="/businesses">
            <ArrowLeft className="size-4" /> Back to Leads
          </Link>
        </OutlinedButton>
      </div>
    );
  }

  const locationData = getLocationData(business);

  const rawLeadStatus =
    (business?.leadStatus && business.leadStatus !== "Active" && business.leadStatus !== "Inactive"
      ? business.leadStatus
      : undefined) ||
    (business?.status && business.status !== "Active" && business.status !== "Inactive"
      ? business.status
      : undefined) ||
    business?.leadStatus;

  const leadStatusDisplay = formatLeadStatus(rawLeadStatus);
  const websiteUrl = business.website
    ? normalizeHttpUrl(business.website)
    : "";

  return (
    <DetailsPageLayout
      breadcrumb={
        <Breadcrumb
          items={[
            { label: "Leads", href: "/businesses" },
            { label: "Lead Details" },
          ]}
        />
      }
      actions={
        <Actions
          primary={isInactive ? {
            label: "Activate Lead",
            onSelect: () => openDeactivateModal(String(business?.id)),
          } : {
            label: "Add Follow-up",
            icon: <Plus className="size-4" />,
            onSelect: () => openFollowUpModal(String(business?.id)),
          }}
          secondary={isInactive ? [] : [
            {
              label: "Edit Lead",
              icon: <Edit2 className="size-4" />,
              href: `/businesses/form/${business.id}`,
            },
            {
              label: business.assignedToId ? "Reassign Owner" : "Assign Owner",
              icon: <UserRoundCog className="size-4" />,
              onSelect: () => setIsAssignmentOpen(true),
            },
            {
              label: "Add Follow Up",
              onSelect: () => openFollowUpModal(String(business?.id)),
            },
            {
              label: "Deactivate",
              onSelect: () => openDeactivateModal(String(business?.id)),
            },
          ]}
        />
      }
      content={
        <>
          {/* 2. SINGLE MERGED CARD (Full Width) */}
          <Card className="w-full overflow-hidden border-[#e4ecf2] shadow-[0_4px_20px_rgba(20,40,60,0.04)]">
            <CardHeader className="flex flex-col gap-3 border-b border-slate-200/80 bg-white p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 sm:px-6 sm:py-4">
              <div className="flex min-w-0 w-full flex-1 items-start gap-3 sm:gap-4">
                <Avatar className="size-12 shrink-0 rounded-xl border border-primary/10 sm:size-14">
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-bold text-primary sm:text-xl">
                    {business.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
                    <CardTitle className="min-w-0 max-w-full text-lg font-bold leading-tight tracking-tight text-slate-900 sm:text-xl" title={business.name}>
                      {business.name}
                    </CardTitle>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                    <ActivityStateText active={!isInactive} />
                    {leadStatusDisplay && leadStatusDisplay !== "-" && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <StatusBadge
                          status={rawLeadStatus || leadStatusDisplay}
                          label={leadStatusDisplay}
                        />
                      </>
                    )}
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <Building2 className="size-4 shrink-0 text-slate-400" />
                      <span>{business.category || "Uncategorized"}</span>
                    </p>
                  </div>
                  <div className="min-w-0 [&>div]:!mt-0">
                    <TagAssignmentPicker
                      entity="BUSINESS"
                      entityId={String(business.id)}
                      tags={business.tags ?? []}
                      variant="details"
                    />
                  </div>
                </div>
              </div>

              {!isInactive && <div className="flex shrink-0 items-center gap-2 self-start">
                {/* Phone Dropdown / Single Button */}
                {headerPhones.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <OutlinedButton
                        aria-label="Call lead"
                        title="Call lead"
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
                            {p.type || (p.isPrimary ? "Primary" : "Secondary")})
                          </a>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : headerPhones.length === 1 ? (
                  <OutlinedButton
                    asChild
                    aria-label="Call lead"
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
                        aria-label="Message lead on WhatsApp"
                        title="Message lead on WhatsApp"
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
                            href={`https://wa.me/91${cleanNumber(w.number)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            {w.number} (
                            {w.type || (w.isPrimary ? "Primary" : "Secondary")})
                          </a>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : headerWhatsapps.length === 1 ? (
                  <OutlinedButton
                    asChild
                    aria-label="Message lead on WhatsApp"
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

                {locationData.isAvailable ? (
                  <OutlinedButton
                    asChild
                    aria-label="View lead location on Google Maps"
                    title="View lead location on Google Maps"
                    className="h-9 w-9 p-0 flex items-center justify-center text-primary border-gray-200 hover:bg-primary/10 cursor-pointer"
                  >
                    <a
                      href={locationData.mapLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => openGoogleMapsOnce(e, locationData.mapLink)}
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
              </div>}
            </CardHeader>

            <CardContent className="p-0">
              <div className="px-5 py-5 sm:px-7">
                <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="flex min-w-0 items-start gap-3 py-1 pb-4 sm:py-0 sm:pr-5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">Address</p>
                      <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">
                        {business.address || (business.city ? business.city : "Location not available")}
                      </p>
                    </div>
                  </div>
                  <div className="flex min-w-0 items-start gap-3 py-4 sm:px-5 sm:py-0">
                    <Globe className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">Website</p>
                      {websiteUrl ? (
                        <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-sm font-semibold text-primary hover:underline">
                          {websiteUrl}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-800">-</p>
                      )}
                    </div>
                  </div>
                  <div className="flex min-w-0 items-start gap-3 pt-4 sm:px-5 sm:pt-0">
                    <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">Email</p>
                      {business.email ? (
                        <a href={`mailto:${business.email}`} className="mt-1 block break-all text-sm font-semibold text-primary hover:underline">
                          {business.email}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-800">-</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/55 px-5 py-5 sm:px-7">
                <div className="grid grid-cols-1 divide-y divide-slate-200/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="flex min-w-0 items-start gap-3 pb-4 sm:pb-0 sm:pr-5">
                    <Users className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">Assigned to</p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                        {business.assignedToName || business.assignedTo || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex min-w-0 items-start gap-3 py-4 sm:px-5 sm:py-0">
                    <Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">Next follow-up</p>
                      <div className="mt-1">
                        {nextFollowUp && !isInactive ? (
                          <RecordLink href={`/follow-ups/${nextFollowUp.id}`} className="text-sm">
                            {(() => {
                              const raw = nextFollowUp.scheduledAt || (nextFollowUp as any).followUpDate || (nextFollowUp as any).date;
                              const d = raw ? new Date(String(raw).replace(/\s+at\s+/i, " ")) : null;
                              return d && !Number.isNaN(d.getTime()) ? dateFmt.format(d) : raw || "-";
                            })()}
                          </RecordLink>
                        ) : business?.nextFollowUp && business.nextFollowUp !== "-" ? (
                          business.nextFollowUpId && !isInactive ? <RecordLink href={`/follow-ups/${business.nextFollowUpId}`} className="text-sm">{business.nextFollowUp}</RecordLink> : <p className="text-sm font-semibold text-slate-800">{business.nextFollowUp}</p>
                        ) : (
                          <p className="text-sm font-semibold text-slate-800">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex min-w-0 items-start gap-3 pt-4 sm:px-5 sm:pt-0">
                    <Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">Last follow-up</p>
                      <div className="mt-1 truncate text-sm font-semibold text-slate-800">
                        {lastFollowUpItem ? (
                          (() => {
                            const raw = (lastFollowUpItem as { completedAt?: string }).completedAt ?? lastFollowUpItem.scheduledAt ?? (lastFollowUpItem as any).date ?? (lastFollowUpItem as any).followUpDate;
                            const d = raw ? new Date(String(raw).replace(/\s+at\s+/i, " ")) : null;
                            const formatted = d && !Number.isNaN(d.getTime()) ? dateFmt.format(d) : raw || "-";
                            return !isInactive ? <RecordLink href={`/follow-ups/${lastFollowUpItem.id}`}>{formatted}</RecordLink> : formatted;
                          })()
                        ) : business?.lastFollowUp && business.lastFollowUp !== "-" ? (
                          business.lastFollowUpId && !isInactive ? <RecordLink href={`/follow-ups/${business.lastFollowUpId}`}>{business.lastFollowUp}</RecordLink> : business.lastFollowUp
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {business.description && (
                <div className="flex items-start gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
                  <FileText className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Description</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {business.description}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <div className="min-w-0 space-y-6">
              <BusinessDetailsFollowups
                businessId={String(business.id)}
                business={business}
                readOnly={isInactive}
              />
              <BusinessDetailsActivity businessId={String(business.id)} categoryName={business.category} />
            </div>

            <aside className="space-y-6 xl:sticky xl:top-28">
              <BusinessDetailsMap business={business} />
            </aside>
          </section>
          {/* New Follow-up Modal */}
          <AddFollowUpModal businessName={business?.name || "Lead"} />
          {/* Deactivate Business Modal */}
          <DeactivateBusinessModal
            businessName={business?.name || ""}
            businessStatus={business?.status || ""}
            businessIsActive={business.isActive}
          />
          <AssignBusinessDialog
            business={business}
            open={isAssignmentOpen}
            onOpenChange={setIsAssignmentOpen}
          />
        </>
      }
    />
  );
}
