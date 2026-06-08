// QuickSearchPage.tsx — Global shortcut search window
// Press Ctrl+Alt+Space → search prompts → Enter to copy
import { useEffect, useRef, useCallback } from "react";
import { useSearchStore } from "../stores/searchStore";
import { hideQuickSearchWindow } from "../services/windowApi";
import { copyPromptToClipboard } from "../services/clipboardApi";
import { useToast } from "../components/common/Toast";
import QuickSearchBox from "../components/search/QuickSearchBox";
import QuickSearchResultList from "../components/search/QuickSearchResultList";

export default function QuickSearchPage() {
  const {
    query,
    results,
    selectedIndex,
    loading,
    setQuery,
    search,
    selectNext,
    selectPrev,
    getSelected,
    reset,
  } = useSearchStore();

  const { showToast } = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(
    (keyword: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        search(keyword);
      }, 150);
    },
    [search],
  );

  function handleQueryChange(value: string) {
    setQuery(value);
    doSearch(value);
  }

  async function handleEnter() {
    const selected = getSelected();
    if (!selected) return;
    try {
      await copyPromptToClipboard(selected.id);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Copy failed", "error");
    }
    reset();
    hideQuickSearchWindow();
  }

  function handleEscape() {
    reset();
    hideQuickSearchWindow();
  }

  async function handleSelect(promptId: number) {
    try {
      await copyPromptToClipboard(promptId);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Copy failed", "error");
    }
    reset();
    hideQuickSearchWindow();
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-gray-100 select-none">
      <QuickSearchBox
        query={query}
        onChange={handleQueryChange}
        onEnter={handleEnter}
        onArrowUp={selectPrev}
        onArrowDown={selectNext}
        onEscape={handleEscape}
        loading={loading}
      />

      <QuickSearchResultList
        results={results}
        selectedIndex={selectedIndex}
        query={query}
        onSelect={(prompt) => handleSelect(prompt.id)}
      />

      <div className="flex items-center justify-between border-t border-gray-800 px-4 py-2 text-xs text-gray-600">
        <span>↑↓ Navigate</span>
        <span>↵ Copy to clipboard</span>
        <span>Esc Close</span>
      </div>
    </div>
  );
}
