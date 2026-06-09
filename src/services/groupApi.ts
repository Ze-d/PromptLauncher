// groupApi.ts — Tauri invoke wrappers for group commands
import { invoke } from "@tauri-apps/api/core";
import type { Group } from "../types/prompt";

export interface CreateGroupInput {
  name: string;
  sortOrder?: number;
}

export interface UpdateGroupInput {
  id: number;
  name?: string;
  sortOrder?: number;
}

export async function createGroup(input: CreateGroupInput): Promise<Group> {
  return invoke("create_group", { input });
}

export async function listGroups(): Promise<Group[]> {
  return invoke("list_groups");
}

export async function updateGroup(input: UpdateGroupInput): Promise<Group> {
  return invoke("update_group", { input });
}

export async function deleteGroup(id: number): Promise<void> {
  return invoke("delete_group", { id });
}
