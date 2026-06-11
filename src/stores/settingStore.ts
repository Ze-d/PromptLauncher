// settingStore.ts — Settings state management (Zustand)
import { create } from "zustand";
import type { AppSettings } from "../types/setting";
import * as settingApi from "../services/settingApi";
import { asyncStateSlice, runAsync, type AsyncState } from "./helpers";

const DEFAULTS: AppSettings = {
  globalShortcut: "Ctrl+Alt+Space",
  theme: "system",
  defaultAction: "copy",
  closeToTray: true,
  autoStart: false,
  quickWindowWidth: 720,
  quickWindowHeight: 420,
  sidebarRatio: 18,
  listRatio: 27,
  sidebarCollapsed: false,
};

const SETTING_DB_KEYS: Record<keyof AppSettings, string> = {
  globalShortcut: "global_shortcut",
  theme: "theme",
  defaultAction: "default_action",
  closeToTray: "close_to_tray",
  autoStart: "auto_start",
  quickWindowWidth: "quick_window_width",
  quickWindowHeight: "quick_window_height",
  sidebarRatio: "sidebar_ratio",
  listRatio: "list_ratio",
  sidebarCollapsed: "sidebar_collapsed",
};

interface SettingState extends AsyncState {
  settings: AppSettings;
  loadSettings: () => Promise<void>;
  saveSetting: (key: keyof AppSettings, value: string | boolean | number) => Promise<void>;
  clearError: () => void;
}

export const useSettingStore = create<SettingState>((set, get) => ({
  settings: DEFAULTS,
  ...asyncStateSlice<SettingState>(set),

  loadSettings: async () => {
    await runAsync(set, () => settingApi.getSettings(), {
      onOk: (settings) => ({ settings }),
    });
  },

  saveSetting: (key, value) =>
    runAsync(set, () => settingApi.updateSetting(SETTING_DB_KEYS[key], String(value)), {
      onOk: () => ({ settings: { ...get().settings, [key]: value } }),
    }),
}));
