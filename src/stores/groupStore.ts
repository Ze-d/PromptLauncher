// groupStore.ts — Group state management (Zustand)
import { create } from "zustand";
import type { Group } from "../types/prompt";
import * as groupApi from "../services/groupApi";
import type { CreateGroupInput, UpdateGroupInput } from "../services/groupApi";

interface GroupState {
  groups: Group[];
  loading: boolean;
  error: string | null;

  // Actions
  loadGroups: () => Promise<void>;
  createGroup: (input: CreateGroupInput) => Promise<Group>;
  updateGroup: (input: UpdateGroupInput) => Promise<Group>;
  deleteGroup: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  loading: false,
  error: null,

  loadGroups: async () => {
    set({ loading: true, error: null });
    try {
      const groups = await groupApi.listGroups();
      set({ groups, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  createGroup: async (input: CreateGroupInput) => {
    set({ loading: true, error: null });
    try {
      const group = await groupApi.createGroup(input);
      set((s) => ({
        groups: [...s.groups, group],
        loading: false,
      }));
      return group;
    } catch (e) {
      set({ error: String(e), loading: false });
      throw e;
    }
  },

  updateGroup: async (input: UpdateGroupInput) => {
    set({ loading: true, error: null });
    try {
      const updated = await groupApi.updateGroup(input);
      set((s) => ({
        groups: s.groups.map((g) => (g.id === updated.id ? updated : g)),
        loading: false,
      }));
      return updated;
    } catch (e) {
      set({ error: String(e), loading: false });
      throw e;
    }
  },

  deleteGroup: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await groupApi.deleteGroup(id);
      set((s) => ({
        groups: s.groups.filter((g) => g.id !== id),
        loading: false,
      }));
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
