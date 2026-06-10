// promptStore.test.ts — Prompt state management tests
import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePromptStore } from "./promptStore";

vi.mock("../services/promptApi", () => ({
  listPrompts: vi.fn(),
  createPrompt: vi.fn(),
  updatePrompt: vi.fn(),
  deletePrompt: vi.fn(),
}));

import * as promptApi from "../services/promptApi";

const mockApi = promptApi as unknown as {
  listPrompts: ReturnType<typeof vi.fn>;
  createPrompt: ReturnType<typeof vi.fn>;
  updatePrompt: ReturnType<typeof vi.fn>;
  deletePrompt: ReturnType<typeof vi.fn>;
};

function makePrompt(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    title: "Test",
    content: "content",
    description: null,
    groupId: null,
    groupName: null,
    tags: [] as string[],
    isFavorite: false,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: "2025-01-01T00:00:00",
    updatedAt: "2025-01-01T00:00:00",
    ...overrides,
  };
}

describe("promptStore", () => {
  beforeEach(() => {
    usePromptStore.setState({
      prompts: [],
      selectedPrompt: null,
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe("loadPrompts", () => {
    it("should load prompts from API", async () => {
      const prompts = [makePrompt({ id: 1 }), makePrompt({ id: 2 })];
      mockApi.listPrompts.mockResolvedValueOnce(prompts);

      await usePromptStore.getState().loadPrompts();
      expect(usePromptStore.getState().prompts).toEqual(prompts);
      expect(usePromptStore.getState().loading).toBe(false);
    });

    it("should set error on failure", async () => {
      mockApi.listPrompts.mockRejectedValueOnce(new Error("fail"));
      await usePromptStore.getState().loadPrompts();
      expect(usePromptStore.getState().error).toContain("fail");
    });
  });

  describe("selectPrompt", () => {
    it("should select prompt by id", () => {
      const p = makePrompt({ id: 5, title: "Target" });
      usePromptStore.setState({ prompts: [p, makePrompt({ id: 6 })] });

      usePromptStore.getState().selectPrompt(5);
      expect(usePromptStore.getState().selectedPrompt).toEqual(p);
    });

    it("should set null for unknown id", () => {
      usePromptStore.setState({ prompts: [makePrompt({ id: 1 })], selectedPrompt: makePrompt({ id: 1 }) });
      usePromptStore.getState().selectPrompt(999);
      expect(usePromptStore.getState().selectedPrompt).toBeNull();
    });
  });

  describe("createPrompt", () => {
    it("should add new prompt to front of list", async () => {
      const existing = makePrompt({ id: 1, title: "Old" });
      usePromptStore.setState({ prompts: [existing] });

      const created = makePrompt({ id: 2, title: "New" });
      mockApi.createPrompt.mockResolvedValueOnce(created);

      const result = await usePromptStore.getState().createPrompt({
        title: "New",
        content: "c",
      });

      expect(result).toEqual(created);
      const state = usePromptStore.getState();
      expect(state.prompts).toEqual([created, existing]);
      expect(state.selectedPrompt).toEqual(created);
    });
  });

  describe("updatePrompt", () => {
    it("should update prompt in list", async () => {
      const old = makePrompt({ id: 1, title: "Old" });
      usePromptStore.setState({ prompts: [old] });

      const updated = makePrompt({ id: 1, title: "Updated" });
      mockApi.updatePrompt.mockResolvedValueOnce(updated);

      const result = await usePromptStore.getState().updatePrompt({
        id: 1,
        title: "Updated",
      });

      expect(result).toEqual(updated);
      expect(usePromptStore.getState().prompts[0].title).toBe("Updated");
    });
  });

  describe("deletePrompt", () => {
    it("should remove prompt from list", async () => {
      const p = makePrompt({ id: 1 });
      usePromptStore.setState({ prompts: [p], selectedPrompt: p });

      mockApi.deletePrompt.mockResolvedValueOnce(undefined);
      await usePromptStore.getState().deletePrompt(1);

      expect(usePromptStore.getState().prompts).toEqual([]);
      expect(usePromptStore.getState().selectedPrompt).toBeNull();
    });
  });

  describe("clearSelection", () => {
    it("should set selectedPrompt to null", () => {
      usePromptStore.setState({ selectedPrompt: makePrompt() });
      usePromptStore.getState().clearSelection();
      expect(usePromptStore.getState().selectedPrompt).toBeNull();
    });
  });
});
