"use client";

import { useBusinessQuery } from "@/hooks/use-businesses";
import { isRecordInactive } from "@/lib/records/activity";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
import Actions from "@/components/common/Actions";
import FollowUpDetails from "@/components/follow-ups/FollowUpDetails";
import FollowUpEditDialog from "@/components/follow-ups/FollowUpEditDialog";
import NextFollowUpDialog from "@/components/follow-ups/NextFollowUpDialog";
import CancelFollowUpDialog from "@/components/follow-ups/CancelFollowUpDialog";
import CompleteFollowUpDialog from "@/components/follow-ups/CompleteFollowUpDialog";
import {
  useCancelFollowUp,
  useCompleteFollowUp,
  useFollowUpQuery,
} from "@/hooks/use-follow-ups";
import {
  canCancelFollowUp,
  canCompleteFollowUp,
  canCreateNextFollowUp,
  canEditFollowUp,
} from "@/lib/follow-ups/actions";
import { useFollowUpListStore } from "@/store/follow-up-list-store";

export default function FollowUpDetailsPage() {
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [nextFollowUpOpen, setNextFollowUpOpen] = useState(false);

  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  useEffect(() => {
    if (id) useFollowUpListStore.getState().highlightFollowUp(id, true);
  }, [id]);
  const query = useFollowUpQuery(id);
  const businessQuery = useBusinessQuery(query.data?.businessId);
  const readOnly = !businessQuery.data || isRecordInactive(businessQuery.data);
  const cancelMutation = useCancelFollowUp();
  const completeMutation = useCompleteFollowUp();

  const handleCancel = async () => {
    if (readOnly || !id || !query.data || !canCancelFollowUp(query.data)) return;
    try {
      await cancelMutation.mutateAsync(id);
      useFollowUpListStore.getState().highlightFollowUp(id, true);
      toast.success("Follow-up cancelled");
      setCancelOpen(false);
    } catch {
      toast.error("Unable to cancel follow-up.");
    }
  };

  const handleComplete = async () => {
    if (readOnly || !id || !query.data || !canCompleteFollowUp(query.data)) return;
    try {
      await completeMutation.mutateAsync(id);
      useFollowUpListStore.getState().highlightFollowUp(id, true);
      toast.success("Follow-up marked as completed");
      setCompleteOpen(false);
    } catch {
      toast.error("Unable to mark follow-up as completed.");
    }
  };

  if (query.isLoading) {
    return (
      <DetailsPageLayout
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Follow-ups", href: "/follow-ups" },
              { label: "Details" },
            ]}
          />
        }
        content={
          <div className="py-16 text-center text-sm text-[#64748b]">
            Loading follow-up details...
          </div>
        }
      />
    );
  }

  if (query.isError || !query.data) {
    return (
      <DetailsPageLayout
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Follow-ups", href: "/follow-ups" },
              { label: "Details" },
            ]}
          />
        }
        content={
          <div role="alert" className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-800">Unable to load this follow-up.</p>
            <p className="mt-2 text-xs text-slate-500">Try again to load the latest details.</p>
            <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className="mt-4 text-sm font-semibold text-primary hover:underline disabled:opacity-50">{query.isFetching ? "Retrying?" : "Try again"}</button>
          </div>
        }
      />
    );
  }

  const followUp = query.data;

  return (
    <>
      <DetailsPageLayout
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Follow-ups", href: "/follow-ups" },
              {
                label: followUp.businessName,
                href: `/businesses/${followUp.businessId}`,
              },
              { label: "Follow-up details" },
            ]}
          />
        }

        actions={readOnly ? undefined : canCreateNextFollowUp(followUp) ? (
            <Actions
              primary={{
                label: "Next Follow-Up",
                icon: <Plus className="size-4" />,
                onSelect: () => setNextFollowUpOpen(true),
              }}
              secondary={[
                ...(canEditFollowUp(followUp)
                  ? [{
                      label: "Edit / Reschedule",
                      icon: <Pencil className="size-4" />,
                      onSelect: () => setEditOpen(true),
                    }]
                  : []),
                ...(canCancelFollowUp(followUp)
                  ? [{
                      label: "Cancel Follow-Up",
                      icon: <Trash2 className="size-4" />,
                      destructive: true,
                      onSelect: () => setCancelOpen(true),
                    }]
                  : []),
              ]}
            />
          ) : canCompleteFollowUp(followUp) ? (
            <Actions
              primary={{
                label: "Mark as Completed",
                icon: <CheckCircle2 className="size-4" />,
                onSelect: () => setCompleteOpen(true),
              }}
              secondary={[
                ...(canEditFollowUp(followUp)
                  ? [{
                      label: "Edit / Reschedule",
                      icon: <Pencil className="size-4" />,
                      onSelect: () => setEditOpen(true),
                    }]
                  : []),
                ...(canCancelFollowUp(followUp)
                  ? [{
                      label: "Cancel Follow-Up",
                      icon: <Trash2 className="size-4" />,
                      destructive: true,
                      onSelect: () => setCancelOpen(true),
                    }]
                  : []),
              ]}
            />
          ) : null}
        content={<FollowUpDetails followUp={followUp} />}
      />
      <FollowUpEditDialog
        followUp={followUp}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <NextFollowUpDialog
        followUp={followUp}
        open={nextFollowUpOpen}
        onOpenChange={setNextFollowUpOpen}
      />
      <CancelFollowUpDialog
        open={cancelOpen}
        businessName={followUp.businessName}
        loading={cancelMutation.isPending}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
      />
      <CompleteFollowUpDialog
        open={completeOpen}
        businessName={followUp.businessName}
        loading={completeMutation.isPending}
        onOpenChange={setCompleteOpen}
        onConfirm={handleComplete}
      />
    </>
  );
}
