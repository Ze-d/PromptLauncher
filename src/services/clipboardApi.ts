// clipboardApi.ts — Tauri invoke wrappers for clipboard commands
import { invoke } from "@tauri-apps/api/core";

export async function copyTextToClipboard(text: string): Promise<void> {
  await invoke("copy_to_clipboard", { text });
}

export async function copyPromptToClipboard(id: number): Promise<void> {
  await invoke("copy_prompt_to_clipboard", { id });
}
