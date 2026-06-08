// promptApi.ts — Tauri invoke wrappers for prompt commands
import { invoke } from "@tauri-apps/api/core";
import type {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  SearchPromptInput,
} from "../types/prompt";

export async function createPrompt(input: CreatePromptInput): Promise<Prompt> {
  return invoke("create_prompt", { input });
}

export async function updatePrompt(input: UpdatePromptInput): Promise<Prompt> {
  return invoke("update_prompt", { input });
}

export async function deletePrompt(id: number): Promise<void> {
  return invoke("delete_prompt", { id });
}

export async function getPrompt(id: number): Promise<Prompt> {
  return invoke("get_prompt", { id });
}

export async function listPrompts(): Promise<Prompt[]> {
  return invoke("list_prompts");
}

export async function searchPrompts(input: SearchPromptInput): Promise<Prompt[]> {
  return invoke("search_prompts", { input });
}

export async function markPromptUsed(id: number): Promise<void> {
  return invoke("mark_prompt_used", { id });
}
