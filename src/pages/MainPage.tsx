// MainPage.tsx — Prompt management page (thin orchestrator)
// Layout: Sidebar | PromptList | PromptEditor
import { useEffect, useState, useCallback } from "react";
import { usePromptStore } from "../stores/promptStore";
import { useGroupManager } from "../hooks/useGroupManager";
import Sidebar from "../components/layout/Sidebar";
import FilterBar from "../components/layout/FilterBar";
import PromptList from "../components/prompt/PromptList";
import PromptEditor from "../components/prompt/PromptEditor";
import SettingsModal from "../components/settings/SettingsModal";

export default function MainPage() {
  const { prompts, selectedPrompt, loadPrompts, selectPrompt, clearSelection } =
    usePromptStore();
  const gm = useGroupManager();

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar gm={gm} onNewPrompt={clearSelection} />

      {/* Prompt List */}
      <main className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shrink-0">
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

      {/* Editor */}
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
