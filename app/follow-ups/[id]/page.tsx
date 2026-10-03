"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Breadcrumb from "@/components/common/Breadcrumb";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
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

export default function FollowUpDetailsPage() {
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [nextFollowUpOpen, setNextFollowUpOpen] = useState(false);

  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useFollowUpQuery(id);
  const cancelMutation = useCancelFollowUp();
  const completeMutation = useCompleteFollowUp();

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelMutation.mutateAsync(id);
      toast.success("Follow-up cancelled");
      setCancelOpen(false);
    } catch {
      toast.error("Unable to cancel follow-up.");
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      await completeMutation.mutateAsync(id);
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
          <div className="py-16 text-center text-sm text-red-600">
            Unable to load this follow-up.
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
              { label: followUp.businessName },
            ]}
          />
        }
        content={
          <FollowUpDetails
            followUp={followUp}
            onEdit={() => setEditOpen(true)}
            onComplete={() => setCompleteOpen(true)}
            onCancel={() => setCancelOpen(true)}
            onNextFollowUp={() => setNextFollowUpOpen(true)}
          />
        }
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
