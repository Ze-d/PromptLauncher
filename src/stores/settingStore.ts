// settingStore.ts — Settings state management (Zustand)
import { create } from "zustand";
import type { AppSettings } from "../types/setting";
import * as settingApi from "../services/settingApi";

const DEFAULTS: AppSettings = {
  globalShortcut: "Ctrl+Alt+Space",
  theme: "system",
  defaultAction: "copy",
  closeToTray: true,
  autoStart: false,
  quickWindowWidth: 720,
  quickWindowHeight: 420,
};

interface SettingState {
  settings: AppSettings;
  loading: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  saveSetting: (key: keyof AppSettings, value: string | boolean | number) => Promise<void>;
  clearError: () => void;
}

export const useSettingStore = create<SettingState>((set) => ({
  settings: DEFAULTS,
  loading: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await settingApi.getSettings();
      set({ settings, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  saveSetting: async (key, value) => {
    set({ loading: true, error: null });
    try {
      await settingApi.updateSetting(key, String(value));
      set((s) => ({
        settings: { ...s.settings, [key]: value },
        loading: false,
      }));
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
