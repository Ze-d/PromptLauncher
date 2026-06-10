// settingStore.test.ts — Settings state management tests
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSettingStore } from "./settingStore";

vi.mock("../services/settingApi", () => ({
  getSettings: vi.fn(),
  updateSetting: vi.fn(),
}));

import * as settingApi from "../services/settingApi";

const mockApi = settingApi as unknown as {
  getSettings: ReturnType<typeof vi.fn>;
  updateSetting: ReturnType<typeof vi.fn>;
};

describe("settingStore", () => {
  beforeEach(() => {
    useSettingStore.setState({
      settings: {
        globalShortcut: "Ctrl+Alt+Space",
        theme: "system",
        defaultAction: "copy",
        closeToTray: true,
        autoStart: false,
        quickWindowWidth: 720,
        quickWindowHeight: 420,
      },
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe("loadSettings", () => {
    it("should load settings from API", async () => {
      const apiSettings = {
        globalShortcut: "Ctrl+Shift+K",
        theme: "dark",
        defaultAction: "copy",
        closeToTray: false,
        autoStart: true,
        quickWindowWidth: 800,
        quickWindowHeight: 600,
      };
      mockApi.getSettings.mockResolvedValueOnce(apiSettings);

      await useSettingStore.getState().loadSettings();
      expect(useSettingStore.getState().settings.theme).toBe("dark");
      expect(useSettingStore.getState().settings.autoStart).toBe(true);
    });

    it("should handle API errors", async () => {
      mockApi.getSettings.mockRejectedValueOnce(new Error("fail"));
      await useSettingStore.getState().loadSettings();
      expect(useSettingStore.getState().error).toContain("fail");
    });
  });

  describe("saveSetting", () => {
    it("should update a single setting and call API", async () => {
      mockApi.updateSetting.mockResolvedValueOnce(undefined);

      await useSettingStore.getState().saveSetting("theme", "light");
      expect(useSettingStore.getState().settings.theme).toBe("light");
      expect(mockApi.updateSetting).toHaveBeenCalledWith("theme", "light");
    });

    it("should save boolean values as strings", async () => {
      mockApi.updateSetting.mockResolvedValueOnce(undefined);

      await useSettingStore.getState().saveSetting("closeToTray", false);
      expect(useSettingStore.getState().settings.closeToTray).toBe(false);
      expect(mockApi.updateSetting).toHaveBeenCalledWith("closeToTray", "false");
    });

    it("should save numeric values as strings", async () => {
      mockApi.updateSetting.mockResolvedValueOnce(undefined);

      await useSettingStore.getState().saveSetting("quickWindowWidth", 900);
      expect(useSettingStore.getState().settings.quickWindowWidth).toBe(900);
      expect(mockApi.updateSetting).toHaveBeenCalledWith("quickWindowWidth", "900");
    });
  });
});
