// searchStore.test.ts — Search state management tests
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSearchStore } from "./searchStore";

// Mock the promptApi module
vi.mock("../services/promptApi", () => ({
  searchPrompts: vi.fn(),
}));

import * as promptApi from "../services/promptApi";

const mockSearchPrompts = promptApi.searchPrompts as ReturnType<typeof vi.fn>;

function makePrompt(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    title: "Test Prompt",
    content: "test content",
    description: null,
    groupId: null,
    groupName: null,
    tags: [],
    isFavorite: false,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: "2025-01-01T00:00:00",
    updatedAt: "2025-01-01T00:00:00",
    ...overrides,
  };
}

describe("searchStore", () => {
  beforeEach(() => {
    useSearchStore.setState({
      query: "",
      results: [],
      selectedIndex: 0,
      loading: false,
    });
    vi.clearAllMocks();
  });

  describe("setQuery", () => {
    it("should update query string", () => {
      useSearchStore.getState().setQuery("hello");
      expect(useSearchStore.getState().query).toBe("hello");
    });
  });

  describe("search", () => {
    it("should clear results for empty keyword", async () => {
      await useSearchStore.getState().search("   ");
      expect(useSearchStore.getState().results).toEqual([]);
      expect(useSearchStore.getState().loading).toBe(false);
    });

    it("should call API and store results", async () => {
      const mockPrompt = makePrompt({ id: 1, title: "Rust" });
      mockSearchPrompts.mockResolvedValueOnce([mockPrompt]);

      await useSearchStore.getState().search("rust");
      expect(useSearchStore.getState().results).toEqual([mockPrompt]);
      expect(useSearchStore.getState().selectedIndex).toBe(0);
      expect(useSearchStore.getState().loading).toBe(false);
    });

    it("should handle API errors gracefully", async () => {
      mockSearchPrompts.mockRejectedValueOnce(new Error("DB error"));

      await useSearchStore.getState().search("rust");
      expect(useSearchStore.getState().results).toEqual([]);
      expect(useSearchStore.getState().loading).toBe(false);
    });
  });

  describe("selection navigation", () => {
    it("should select next with wrapping", () => {
      useSearchStore.setState({
        results: [makePrompt({ id: 1 }), makePrompt({ id: 2 }), makePrompt({ id: 3 })],
        selectedIndex: 0,
      });

      useSearchStore.getState().selectNext();
      expect(useSearchStore.getState().selectedIndex).toBe(1);

      useSearchStore.getState().selectNext();
      expect(useSearchStore.getState().selectedIndex).toBe(2);

      useSearchStore.getState().selectNext();
      expect(useSearchStore.getState().selectedIndex).toBe(0); // wraps
    });

    it("should select prev with wrapping", () => {
      useSearchStore.setState({
        results: [makePrompt({ id: 1 }), makePrompt({ id: 2 })],
        selectedIndex: 0,
      });

      useSearchStore.getState().selectPrev();
      expect(useSearchStore.getState().selectedIndex).toBe(1); // wraps to end
    });

    it("should be no-op when results are empty", () => {
      useSearchStore.setState({ results: [], selectedIndex: 0 });
      useSearchStore.getState().selectNext();
      expect(useSearchStore.getState().selectedIndex).toBe(0);

      useSearchStore.getState().selectPrev();
      expect(useSearchStore.getState().selectedIndex).toBe(0);
    });
  });

  describe("getSelected", () => {
    it("should return the currently selected prompt", () => {
      const p = makePrompt({ id: 42 });
      useSearchStore.setState({ results: [p], selectedIndex: 0 });
      expect(useSearchStore.getState().getSelected()).toEqual(p);
    });

    it("should return null when results are empty", () => {
      useSearchStore.setState({ results: [], selectedIndex: 0 });
      expect(useSearchStore.getState().getSelected()).toBeNull();
    });

    it("should return null when index is out of bounds", () => {
      useSearchStore.setState({
        results: [makePrompt({ id: 1 })],
        selectedIndex: 5,
      });
      expect(useSearchStore.getState().getSelected()).toBeNull();
    });
  });

  describe("reset", () => {
    it("should clear all state", () => {
      useSearchStore.setState({
        query: "test",
        results: [makePrompt()],
        selectedIndex: 3,
        loading: true,
      });

      useSearchStore.getState().reset();
      const state = useSearchStore.getState();
      expect(state.query).toBe("");
      expect(state.results).toEqual([]);
      expect(state.selectedIndex).toBe(0);
      expect(state.loading).toBe(false);
    });
  });
});
