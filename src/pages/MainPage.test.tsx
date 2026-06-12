// MainPage.test.tsx — Main page orchestration tests
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MainPage from "./MainPage";

const loadPromptsMock = vi.fn();
const loadSettingsMock = vi.fn();

vi.mock("../stores/promptStore", () => ({
  usePromptStore: () => ({
    prompts: [],
    selectedPrompt: null,
    loadPrompts: loadPromptsMock,
    selectPrompt: vi.fn(),
    clearSelection: vi.fn(),
  }),
}));

vi.mock("../stores/settingStore", () => ({
  useSettingStore: (selector: (state: { loadSettings: typeof loadSettingsMock }) => unknown) =>
    selector({ loadSettings: loadSettingsMock }),
}));

vi.mock("../hooks/useGroupManager", () => ({
  useGroupManager: () => ({
    activeGroup: "all",
    groups: [],
  }),
}));

vi.mock("../hooks/useResizableColumns", () => ({
  useResizableColumns: () => ({
    containerRef: { current: null },
    sidebarWidth: 180,
    listWidth: 270,
    sidebarCollapsed: false,
    resizeSidebar: vi.fn(),
    resizeList: vi.fn(),
    toggleSidebar: vi.fn(),
  }),
}));

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <aside data-testid="sidebar" />,
}));

vi.mock("../components/layout/ResizeHandle", () => ({
  default: () => <div data-testid="resize-handle" />,
}));

vi.mock("../components/layout/FilterBar", () => ({
  default: () => <div data-testid="filter-bar" />,
}));

vi.mock("../components/prompt/PromptList", () => ({
  default: () => <div data-testid="prompt-list" />,
}));

vi.mock("../components/prompt/PromptEditor", () => ({
  default: () => <div data-testid="prompt-editor" />,
}));

vi.mock("../components/settings/SettingsModal", () => ({
  default: () => <div data-testid="settings-modal" />,
}));

describe("MainPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadPromptsMock.mockResolvedValue(undefined);
    loadSettingsMock.mockResolvedValue(undefined);
  });

  it("loads persisted settings on mount so resizable columns can restore saved layout", async () => {
    render(<MainPage />);

    await waitFor(() => {
      expect(loadSettingsMock).toHaveBeenCalledTimes(1);
    });
  });
});
