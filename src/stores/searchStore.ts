// searchStore.ts — Search state management (Zustand)
import { create } from "zustand";
import type { Prompt } from "../types/prompt";
import * as promptApi from "../services/promptApi";

interface SearchState {
  query: string;
  results: Prompt[];
  selectedIndex: number;
  loading: boolean;

  setQuery: (q: string) => void;
  search: (keyword: string) => Promise<void>;
  selectNext: () => void;
  selectPrev: () => void;
  getSelected: () => Prompt | null;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  selectedIndex: 0,
  loading: false,

  setQuery: (q: string) => set({ query: q }),

  search: async (keyword: string) => {
    if (!keyword.trim()) {
      set({ results: [], selectedIndex: 0, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const results = await promptApi.searchPrompts({
        keyword: keyword.trim(),
        limit: 20,
      });
      set({ results, selectedIndex: 0, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  selectNext: () => {
    const { results, selectedIndex } = get();
    if (results.length === 0) return;
    set({ selectedIndex: (selectedIndex + 1) % results.length });
  },

  selectPrev: () => {
    const { results, selectedIndex } = get();
    if (results.length === 0) return;
    set({
      selectedIndex: (selectedIndex - 1 + results.length) % results.length,
    });
  },

  getSelected: () => {
    const { results, selectedIndex } = get();
    return results[selectedIndex] ?? null;
  },

  reset: () => set({ query: "", results: [], selectedIndex: 0, loading: false }),
}));
