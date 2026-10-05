"use client";

import FollowUpFormDialog from "@/components/follow-ups/FollowUpFormDialog";
import type { FollowUpItem } from "@/types/follow-up";

interface FollowUpEditDialogProps {
  followUp: FollowUpItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FollowUpEditDialog(props: FollowUpEditDialogProps) {
  return <FollowUpFormDialog mode="edit" {...props} />;
}
