"use client";

import FollowUpFormDialog from "@/components/follow-ups/FollowUpFormDialog";
import type { FollowUpOption } from "@/types/follow-up";

interface AddFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBusiness?: FollowUpOption;
}

export default function AddFollowUpDialog(props: AddFollowUpDialogProps) {
  return <FollowUpFormDialog mode="create" {...props} />;
}
