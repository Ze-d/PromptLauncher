// MainPage.tsx — Prompt management page (thin orchestrator)
// Layout: Sidebar | ResizeHandle | PromptList | ResizeHandle | PromptEditor
import { useEffect, useState, useCallback } from "react";
import { usePromptStore } from "../stores/promptStore";
import { useGroupManager } from "../hooks/useGroupManager";
import { useResizableColumns } from "../hooks/useResizableColumns";
import Sidebar from "../components/layout/Sidebar";
import ResizeHandle from "../components/layout/ResizeHandle";
import FilterBar from "../components/layout/FilterBar";
import PromptList from "../components/prompt/PromptList";
import PromptEditor from "../components/prompt/PromptEditor";
import SettingsModal from "../components/settings/SettingsModal";

export default function MainPage() {
  const { prompts, selectedPrompt, loadPrompts, selectPrompt, clearSelection } =
    usePromptStore();
  const gm = useGroupManager();
  const {
    containerRef,
    sidebarWidth,
    listWidth,
    sidebarCollapsed,
    resizeSidebar,
    resizeList,
    toggleSidebar,
  } = useResizableColumns();

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // ── Filtered prompts ──
  const filteredPrompts = useCallback(() => {
    const sorted = [...prompts].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    if (gm.activeGroup === "favorites") return sorted.filter((p) => p.isFavorite);
    if (gm.activeGroup === "recent") {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return sorted.filter(
        (p) => p.lastUsedAt && new Date(p.lastUsedAt).getTime() > cutoff,
      );
    }
    const gid = Number(gm.activeGroup);
    if (!isNaN(gid)) return sorted.filter((p) => p.groupId === gid);
    return sorted;
  }, [prompts, gm.activeGroup])();

  return (
    <div ref={containerRef} className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar — dynamic width, toggleable collapse */}
      <Sidebar
        gm={gm}
        onNewPrompt={clearSelection}
        sidebarWidth={sidebarWidth}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Resize handle: sidebar ↔ list (hidden when collapsed) */}
      <ResizeHandle onResize={resizeSidebar} disabled={sidebarCollapsed} />

      {/* Prompt List — dynamic width */}
      <main
        className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shrink-0"
        style={{ width: listWidth }}
      >
        <FilterBar
          prompts={prompts}
          onFilterMatch={(id) => selectPrompt(id)}
          onSettingsClick={() => setSettingsOpen(true)}
          totalCount={prompts.length}
        />
        <PromptList
          prompts={filteredPrompts}
          selectedId={selectedPrompt?.id ?? null}
          onSelect={(id) => (id === 0 ? clearSelection() : selectPrompt(id))}
        />
      </main>

      {/* Resize handle: list ↔ editor */}
      <ResizeHandle onResize={resizeList} />

      {/* Editor — fills remaining space */}
      <section className="flex-1 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
        <PromptEditor prompt={selectedPrompt} groups={gm.groups} />
      </section>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
