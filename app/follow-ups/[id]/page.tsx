"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/common/Breadcrumb";
import DetailsPageLayout from "@/components/layout/DetailsPageLayout";
import FollowUpDetails from "@/components/follow-ups/FollowUpDetails";
import FollowUpEditDialog from "@/components/follow-ups/FollowUpEditDialog";
import CancelFollowUpDialog from "@/components/follow-ups/CancelFollowUpDialog";
import { useCancelFollowUp, useFollowUpQuery } from "@/hooks/use-follow-ups";

export default function FollowUpDetailsPage() {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useFollowUpQuery(id);
  const cancelMutation = useCancelFollowUp();
  const cancel = async () => {
    if (!id) return;
    try { await cancelMutation.mutateAsync(id); toast.success("Follow-up cancelled"); router.push("/follow-ups"); } catch { toast.error("Unable to cancel follow-up."); }
  };
  if (query.isLoading) return <DetailsPageLayout breadcrumb={<Breadcrumb items={[{ label: "Follow-ups", href: "/follow-ups" }, { label: "Details" }]} />} content={<div className="py-16 text-center text-sm text-[#64748b]">Loading follow-up details...</div>} />;
  if (query.isError || !query.data) return <DetailsPageLayout breadcrumb={<Breadcrumb items={[{ label: "Follow-ups", href: "/follow-ups" }, { label: "Details" }]} />} content={<div className="py-16 text-center text-sm text-red-600">Unable to load this follow-up.</div>} />;
  return <><DetailsPageLayout breadcrumb={<Breadcrumb items={[{ label: "Follow-ups", href: "/follow-ups" }, { label: query.data.businessName }]} />} actions={<Button variant="outline" onClick={() => setCancelOpen(true)} className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="size-4" /> Cancel follow-up</Button>} content={<FollowUpDetails followUp={query.data} onEdit={() => setEditOpen(true)} />} /><FollowUpEditDialog followUp={query.data} open={editOpen} onOpenChange={setEditOpen} /><CancelFollowUpDialog open={cancelOpen} businessName={query.data.businessName} loading={cancelMutation.isPending} onOpenChange={setCancelOpen} onConfirm={cancel} /></>;
}
