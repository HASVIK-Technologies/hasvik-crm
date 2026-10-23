"use client";

import { create } from "zustand";

type Highlight = { id: string; revision: number };

interface ListActionState {
  highlights: Record<string, Highlight | undefined>;
  highlight: (scope: string, id: string | number) => void;
  clear: (scope: string, revision: number) => void;
}

export const useListActionStore = create<ListActionState>((set) => ({
  highlights: {},
  highlight: (scope, id) =>
    set((state) => ({
      highlights: {
        ...state.highlights,
        [scope]: {
          id: String(id),
          revision: (state.highlights[scope]?.revision ?? 0) + 1,
        },
      },
    })),
  clear: (scope, revision) =>
    set((state) =>
      state.highlights[scope]?.revision === revision
        ? { highlights: { ...state.highlights, [scope]: undefined } }
        : state,
    ),
}));
