import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFollowUpNote,
  deleteFollowUpNote,
  getBusinessFollowUpNotes,
  getFollowUpNotes,
  updateFollowUpNote,
} from "@/lib/notes/api";
import { businessQueryKeys, followUpQueryKeys } from "@/lib/query/query-keys";
import type { BusinessFollowUpNote, BusinessFollowUpNotesPage } from "@/types/follow-up";

export function useFollowUpNotesQuery(
  followUpId: string,
  page: number,
  enabled = true,
) {
  return useQuery({
    queryKey: followUpQueryKeys.notes(followUpId, page),
    queryFn: ({ signal }) => getFollowUpNotes(followUpId, page, signal),
    enabled: Boolean(followUpId) && enabled,
    staleTime: 15_000,
  });
}

export function useBusinessFollowUpNotesQuery(businessId: string) {
  return useBusinessFollowUpNotesPageQuery(businessId, 1);
}

export function useBusinessFollowUpNotesPageQuery(businessId: string, page: number) {
  return useQuery({
    queryKey: businessQueryKeys.followUpNotesForBusiness(businessId, page),
    queryFn: ({ signal }) => getBusinessFollowUpNotes(businessId, page, 10, signal),
    enabled: Boolean(businessId),
    staleTime: 15_000,
  });
}

export function useCreateFollowUpNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      followUpId: string;
      content: string;
      businessContext?: { businessId: string; scheduledAt: string; status: string };
    }) => createFollowUpNote(variables.followUpId, variables.content),
    onSuccess: (note, variables) => {
      queryClient.invalidateQueries({
        queryKey: followUpQueryKeys.notesForFollowUp(variables.followUpId),
      });
      if (variables.businessContext) {
        const context = variables.businessContext;
        const timelineKey = businessQueryKeys.followUpNotesForBusiness(context.businessId);
        const newTimelineNote: BusinessFollowUpNote = {
            id: note.id,
            businessId: context.businessId,
            followUpId: variables.followUpId,
            scheduledAt: context.scheduledAt,
            status: context.status,
            content: note.content,
            createdByName: note.createdByName || "You",
            createdAt: note.createdAt || new Date().toISOString(),
          };
        queryClient.setQueryData<BusinessFollowUpNotesPage>(timelineKey, (current) => {
          const currentItems = current?.items ?? [];
          const items = [newTimelineNote, ...currentItems.filter((item) => item.id !== note.id)]
            .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
          return {
            items,
            page: 1,
            limit: current?.limit ?? 10,
            total: (current?.total ?? 0) + (currentItems.some((item) => item.id === note.id) ? 0 : 1),
            totalPages: current?.totalPages,
          };
        });
      }
      // Notes only carry a follow-up ID; refresh any visible business timeline.
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.activities() });
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.followUpNotes() });
      queryClient.invalidateQueries({
        queryKey: [...followUpQueryKeys.all, "activity", variables.followUpId],
      });
    },
  });
}

export function useUpdateFollowUpNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      content,
    }: {
      noteId: string;
      content: string;
      followUpId?: string;
    }) => updateFollowUpNote(noteId, content),
    onSuccess: (_note, variables) => {
      if (variables.followUpId) {
        queryClient.invalidateQueries({
          queryKey: followUpQueryKeys.notesForFollowUp(variables.followUpId),
        });
      }
      queryClient.invalidateQueries({ queryKey: [...followUpQueryKeys.all, "notes"] });
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.activities() });
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.followUpNotes() });
    },
  });
}

export function useDeleteFollowUpNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
    }: {
      noteId: string;
      followUpId?: string;
    }) => deleteFollowUpNote(noteId),
    onSuccess: (_data, variables) => {
      if (variables.followUpId) {
        queryClient.invalidateQueries({
          queryKey: followUpQueryKeys.notesForFollowUp(variables.followUpId),
        });
      }
      queryClient.invalidateQueries({ queryKey: [...followUpQueryKeys.all, "notes"] });
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.activities() });
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.followUpNotes() });
    },
  });
}
