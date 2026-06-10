// promptStore.ts — Prompt state management (Zustand)
import { create } from "zustand";
import type { Prompt, CreatePromptInput, UpdatePromptInput } from "../types/prompt";
import * as promptApi from "../services/promptApi";
import { asyncStateSlice, runAsync, type AsyncState } from "./helpers";

interface PromptState extends AsyncState {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;

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
  ...asyncStateSlice<PromptState>(set),

  loadPrompts: async () => {
    await runAsync(set, () => promptApi.listPrompts(), {
      onOk: (prompts) => ({ prompts }),
    });
  },

  selectPrompt: (id) => {
    const prompt = get().prompts.find((p) => p.id === id) ?? null;
    set({ selectedPrompt: prompt });
  },

  createPrompt: (input) =>
    runAsync(set, () => promptApi.createPrompt(input), {
      onOk: (prompt) => ({
        prompts: [prompt, ...get().prompts],
        selectedPrompt: prompt,
      }),
    }),

  updatePrompt: (input) =>
    runAsync(set, () => promptApi.updatePrompt(input), {
      onOk: (updated) => ({
        prompts: get().prompts.map((p) => (p.id === updated.id ? updated : p)),
        selectedPrompt: updated,
      }),
    }),

  deletePrompt: async (id) => {
    await runAsync(set, () => promptApi.deletePrompt(id), {
      onOk: () => ({
        prompts: get().prompts.filter((p) => p.id !== id),
        selectedPrompt: get().selectedPrompt?.id === id ? null : get().selectedPrompt,
      }),
    });
  },

  clearSelection: () => set({ selectedPrompt: null }),
}));
