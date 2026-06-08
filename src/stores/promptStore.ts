// promptStore.ts — Prompt state management (Zustand)
import { create } from "zustand";
import type { Prompt, CreatePromptInput, UpdatePromptInput } from "../types/prompt";
import * as promptApi from "../services/promptApi";

interface PromptState {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadPrompts: () => Promise<void>;
  selectPrompt: (id: number) => void;
  createPrompt: (input: CreatePromptInput) => Promise<Prompt>;
  updatePrompt: (input: UpdatePromptInput) => Promise<Prompt>;
  deletePrompt: (id: number) => Promise<void>;
  clearSelection: () => void;
  clearError: () => void;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: [],
  selectedPrompt: null,
  loading: false,
  error: null,

  loadPrompts: async () => {
    set({ loading: true, error: null });
    try {
      const prompts = await promptApi.listPrompts();
      set({ prompts, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  selectPrompt: (id: number) => {
    const prompt = get().prompts.find((p) => p.id === id) ?? null;
    set({ selectedPrompt: prompt });
  },

  createPrompt: async (input: CreatePromptInput) => {
    set({ loading: true, error: null });
    try {
      const prompt = await promptApi.createPrompt(input);
      set((s) => ({
        prompts: [prompt, ...s.prompts],
        selectedPrompt: prompt,
        loading: false,
      }));
      return prompt;
    } catch (e) {
      set({ error: String(e), loading: false });
      throw e;
    }
  },

  updatePrompt: async (input: UpdatePromptInput) => {
    set({ loading: true, error: null });
    try {
      const updated = await promptApi.updatePrompt(input);
      set((s) => ({
        prompts: s.prompts.map((p) => (p.id === updated.id ? updated : p)),
        selectedPrompt: updated,
        loading: false,
      }));
      return updated;
    } catch (e) {
      set({ error: String(e), loading: false });
      throw e;
    }
  },

  deletePrompt: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await promptApi.deletePrompt(id);
      set((s) => ({
        prompts: s.prompts.filter((p) => p.id !== id),
        selectedPrompt: s.selectedPrompt?.id === id ? null : s.selectedPrompt,
        loading: false,
      }));
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  clearSelection: () => set({ selectedPrompt: null }),
  clearError: () => set({ error: null }),
}));
