// groupStore.ts — Group state management (Zustand)
import { create } from "zustand";
import type { Group } from "../types/prompt";
import * as groupApi from "../services/groupApi";
import type { CreateGroupInput, UpdateGroupInput } from "../services/groupApi";
import { asyncStateSlice, runAsync, type AsyncState } from "./helpers";

interface GroupState extends AsyncState {
  groups: Group[];

  loadGroups: () => Promise<void>;
  createGroup: (input: CreateGroupInput) => Promise<Group>;
  updateGroup: (input: UpdateGroupInput) => Promise<Group>;
  deleteGroup: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  ...asyncStateSlice<GroupState>(set),

  loadGroups: async () => {
    await runAsync(set, () => groupApi.listGroups(), {
      onOk: (groups) => ({ groups }),
    });
  },

  createGroup: (input) =>
    runAsync(set, () => groupApi.createGroup(input), {
      onOk: (group) => ({ groups: [...get().groups, group] }),
    }),

  updateGroup: (input) =>
    runAsync(set, () => groupApi.updateGroup(input), {
      onOk: (updated) => ({
        groups: get().groups.map((g) => (g.id === updated.id ? updated : g)),
      }),
    }),

  deleteGroup: async (id) => {
    await runAsync(set, () => groupApi.deleteGroup(id), {
      onOk: () => ({ groups: get().groups.filter((g) => g.id !== id) }),
    });
  },
}));
