import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFollowUpNote, getFollowUpNotes } from "@/lib/notes/api";
import { followUpQueryKeys } from "@/lib/query/query-keys";

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
    },
  });
}
