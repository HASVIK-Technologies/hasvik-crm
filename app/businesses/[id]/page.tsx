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
import businessData from "@/data/businessData.json";
import BusinessDetailsMap from "../../../components/business-details/BusinessDetailsMap";
import BusinessDetailsOverview from "../../../components/business-details/BusinessDetailsOverview";
import BusinessDetailsContacts from "../../../components/business-details/BusinessDetailsContacts";
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
} from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { useBusinessQuery } from "@/hooks/use-businesses";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
import { relativeDay } from "@/lib/analytics/relative";
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
      <div className="mx-auto max-w-6xl py-12 text-center text-sm text-bad">
        Unable to load this business. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl py-12 text-center text-sm text-muted">
        Loading business details...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-bad">
          <AlertCircle className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-soft">
          Business not found
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
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
    (business?.leadStatus && business.leadStatus !== "Active" && business.leadStatus !== "Inactive"
      ? business.leadStatus
      : undefined) ||
    (business?.status && business.status !== "Active" && business.status !== "Inactive"
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
            { label: "Business details" },
          ]}
        />
      }
      actions={
        <Actions
          primary={isInactive ? {
            label: "Activate business",
            onSelect: () => openDeactivateModal(String(business?.id)),
          } : {
            label: "Add follow-up",
            icon: <Plus className="size-4" />,
            onSelect: () => openFollowUpModal(String(business?.id)),
          }}
          secondary={isInactive ? [] : [
            {
              label: "Edit business",
              icon: <Edit2 className="size-4" />,
              href: `/businesses/form/${business.id}`,
            },
            {
              label: business.assignedToId ? "Reassign owner" : "Assign owner",
              icon: <UserRoundCog className="size-4" />,
              onSelect: () => setIsAssignmentOpen(true),
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
          <Card className="w-full overflow-hidden border-line shadow-card">
            <CardHeader className="flex flex-col gap-4 border-b border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:px-7 rounded-2xl">
              <div className="flex min-w-0 w-full flex-1 items-start gap-3 sm:gap-4">
                <Avatar className="size-13 sm:size-16 rounded-xl sm:rounded-2xl shrink-0">
                  <AvatarFallback className="bg-btn/10 text-base sm:text-xl font-semibold text-brand-strong">
                    {business.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-0.5 flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <CardTitle className="min-w-0 max-w-full truncate text-lg font-bold tracking-tight text-ink sm:text-2xl" title={business.name}>
                      {business.name}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <ActivityStateText active={!isInactive} />
                      {leadStatusDisplay && leadStatusDisplay !== "-" && (
                        <StatusBadge
                          status={rawLeadStatus || leadStatusDisplay}
                          label={leadStatusDisplay}
                        />
                      )}
                    </div>
                  </div>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted">
                    <Building2 className="size-3.5 sm:size-4 shrink-0 text-muted" />
                    <span>{business.category || "Uncategorized"}</span>
                    {business.city && (
                      <>
                        <span aria-hidden="true" className="text-line">
                          ·
                        </span>
                        <span>{business.city}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {!isInactive && <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Phone Dropdown / Single Button */}
                {headerPhones.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <OutlinedButton
                        aria-label="Call business"
                        title="Call business"
                        className="h-9 w-9 p-0 flex items-center justify-center text-accent-strong border-line hover:bg-surface-2/10"
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
                    aria-label="Call business"
                    className="h-9 w-9 p-0 flex items-center justify-center text-accent-strong border-line hover:bg-surface-2/10"
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
                        className="h-9 w-9 p-0 flex items-center justify-center text-accent-strong border-line hover:bg-surface-2/10"
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
                    aria-label="Message business on WhatsApp"
                    className="h-9 w-9 p-0 flex items-center justify-center text-accent-strong border-line hover:bg-surface-2/10"
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
                    aria-label="View business location on Google Maps"
                    title="View business location on Google Maps"
                    className="h-9 w-9 p-0 flex items-center justify-center text-brand-strong border-line hover:bg-btn/10 cursor-pointer"
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
                    className="h-9 w-9 p-0 flex items-center justify-center text-muted border-line opacity-50 cursor-not-allowed"
                  >
                    <MapPin className="h-4 w-4" />
                  </OutlinedButton>
                )}
              </div>}
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-surface-2/80 p-3.5">
                  <Users className="mt-0.5 size-4 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted">
                      Owner
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-ink">
                      {business.assignedToName || business.assignedTo || "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-surface-2/80 p-3.5">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted">
                      Next follow-up
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {nextFollowUp && !isInactive ? (
                        <RecordLink href={`/follow-ups/${nextFollowUp.id}`} className="text-sm">
                          {dateFmt.format(new Date(nextFollowUp.scheduledAt))}
                        </RecordLink>
                      ) : business?.nextFollowUp && business.nextFollowUp !== "-" ? (
                        business.nextFollowUpId && !isInactive ? <RecordLink href={`/follow-ups/${business.nextFollowUpId}`} className="text-sm">{business.nextFollowUp}</RecordLink> : <p className="text-sm font-semibold text-ink">{business.nextFollowUp}</p>
                      ) : (
                        <p className="text-sm font-semibold text-ink">
                          -
                        </p>
                      )}
                      {!isInactive && (() => {
                        const due = relativeDay(nextFollowUp?.scheduledAt ?? business?.nextFollowupDate, new Date());
                        return due ? <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${due.tone === "bad" ? "bg-bad-soft text-bad" : due.tone === "warn" ? "bg-warn-soft text-warn" : "bg-surface text-ink-soft"}`}>{due.label}</span> : null;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-surface-2/80 p-3.5">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted">Last follow-up</p>
                    <div className="mt-1 truncate text-sm font-semibold text-ink">
                      {lastFollowUpItem ? (!isInactive ? <RecordLink href={`/follow-ups/${lastFollowUpItem.id}`}>{dateFmt.format(new Date((lastFollowUpItem as { completedAt?: string }).completedAt ?? lastFollowUpItem.scheduledAt))}</RecordLink> : dateFmt.format(new Date((lastFollowUpItem as { completedAt?: string }).completedAt ?? lastFollowUpItem.scheduledAt))) : business?.lastFollowUp && business.lastFollowUp !== "-" ? (business.lastFollowUpId && !isInactive ? <RecordLink href={`/follow-ups/${business.lastFollowUpId}`}>{business.lastFollowUp}</RecordLink> : business.lastFollowUp) : "-"}
                    </div>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-surface-2/80 p-3.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted">
                      Address
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-ink">
                      {business.address || (business.city ? business.city : "Location not available")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <div className="min-w-0 space-y-6">
              <BusinessDetailsFollowups
                businessId={String(business.id)}
                readOnly={isInactive}
              />
              <BusinessDetailsActivity businessId={String(business.id)} />
            </div>

            <aside className="space-y-6 xl:sticky xl:top-28">
              <BusinessDetailsOverview
                business={business}
                businessData={businessData}
              />
              <BusinessDetailsContacts business={business} />
              <BusinessDetailsMap business={business} />
            </aside>
          </section>
          {/* New Follow-up Modal */}
          <AddFollowUpModal businessName={business?.name || "Business"} />
          {/* Deactivate business Modal */}
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
