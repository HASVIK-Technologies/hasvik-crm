import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFollowUpNote,
  deleteFollowUpNote,
  getFollowUpNotes,
  updateFollowUpNote,
} from "@/lib/notes/api";
import { businessQueryKeys, followUpQueryKeys } from "@/lib/query/query-keys";

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

export function useCreateFollowUpNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followUpId,
      content,
    }: {
      followUpId: string;
      content: string;
    }) => createFollowUpNote(followUpId, content),
    onSuccess: (_note, variables) => {
      queryClient.invalidateQueries({
        queryKey: followUpQueryKeys.notesForFollowUp(variables.followUpId),
      });
      // Notes only carry a follow-up ID; refresh any visible business timeline.
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.activities() });
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
    },
  });
}
