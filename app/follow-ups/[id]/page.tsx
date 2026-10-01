"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/common/Breadcrumb";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
import FollowUpDetails from "@/components/follow-ups/FollowUpDetails";
import FollowUpEditDialog from "@/components/follow-ups/FollowUpEditDialog";
import CancelFollowUpDialog from "@/components/follow-ups/CancelFollowUpDialog";
import CompleteFollowUpDialog from "@/components/follow-ups/CompleteFollowUpDialog";
import {
  useCancelFollowUp,
  useFollowUpQuery,
  useUpdateFollowUp,
} from "@/hooks/use-follow-ups";
import type { FollowUpType } from "@/types/follow-up";

export default function FollowUpDetailsPage() {
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useFollowUpQuery(id);
  const cancelMutation = useCancelFollowUp();
  const updateMutation = useUpdateFollowUp();

  const handleCancel = async () => {
    if (!id || !query.data) return;
    try {
      await cancelMutation.mutateAsync({
        id,
        existing: {
          businessId: query.data.businessId,
          assignedTo: query.data.assignedToId || "",
          type: (query.data.type as FollowUpType) || "CALL",
          scheduledAt: query.data.scheduledAt,
          notes: query.data.notes || "",
          reminder: query.data.reminder,
        },
      });
      toast.success("Follow-up cancelled");
      setCancelOpen(false);
    } catch {
      toast.error("Unable to cancel follow-up.");
    }
  };

  const handleComplete = async () => {
    if (!id || !query.data) return;
    try {
      await updateMutation.mutateAsync({
        id,
        followUpId: id,
        businessId: query.data.businessId,
        assignedTo: query.data.assignedToId || "",
        type: (query.data.type as FollowUpType) || "CALL",
        scheduledAt: query.data.scheduledAt,
        status: "COMPLETED",
        notes: query.data.notes || "",
        reminder: query.data.reminder,
      });
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
        actions={
          <div className="flex items-center gap-2">
            {followUp.status !== "COMPLETED" && (
              <Button
                type="button"
                onClick={() => setCompleteOpen(true)}
                className="gap-2 bg-[#027a48] text-white hover:bg-[#05603a]"
              >
                <CheckCircle2 className="size-4" /> Mark as Completed
              </Button>
            )}
            {followUp.status !== "CANCELLED" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelOpen(true)}
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="size-4" /> Cancel follow-up
              </Button>
            )}
          </div>
        }
        content={
          <FollowUpDetails
            followUp={followUp}
            onEdit={() => setEditOpen(true)}
            onComplete={() => setCompleteOpen(true)}
            onCancel={() => setCancelOpen(true)}
          />
        }
      />
      <FollowUpEditDialog
        followUp={followUp}
        open={editOpen}
        onOpenChange={setEditOpen}
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
        loading={updateMutation.isPending}
        onOpenChange={setCompleteOpen}
        onConfirm={handleComplete}
      />
    </>
  );
}
