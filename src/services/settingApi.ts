// settingApi.ts — Tauri invoke wrappers for settings commands
import { invoke } from "@tauri-apps/api/core";
import type { AppSettings } from "../types/setting";

export async function getSettings(): Promise<AppSettings> {
  return invoke("get_settings");
}

export async function updateSetting(key: string, value: string): Promise<void> {
  return invoke("update_setting", { key, value });
}
