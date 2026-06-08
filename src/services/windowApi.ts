// windowApi.ts — Tauri invoke wrappers for window commands
import { invoke } from "@tauri-apps/api/core";

export async function showQuickSearchWindow(): Promise<void> {
  await invoke("show_quick_search_window");
}

export async function hideQuickSearchWindow(): Promise<void> {
  await invoke("hide_quick_search_window");
}

export async function toggleQuickSearchWindow(): Promise<void> {
  await invoke("toggle_quick_search_window");
}

export async function showMainWindow(): Promise<void> {
  await invoke("show_main_window");
}

export async function hideMainWindow(): Promise<void> {
  await invoke("hide_main_window");
}
