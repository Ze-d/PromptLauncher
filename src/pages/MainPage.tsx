// MainPage.tsx — Prompt management (CRUD) page
// Layout: sidebar (groups) | prompt list | prompt editor
import { useEffect, useState } from "react";
import { usePromptStore } from "../stores/promptStore";
import PromptList from "../components/prompt/PromptList";
import PromptEditor from "../components/prompt/PromptEditor";
import type { Group } from "../types/prompt";

// TODO: Replace with real group data from backend
const MOCK_GROUPS: Group[] = [];

export default function MainPage() {
  const { prompts, selectedPrompt, loadPrompts, selectPrompt, clearSelection } =
    usePromptStore();
  const [activeGroup, setActiveGroup] = useState<string>("all");

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const filteredPrompts = (() => {
    if (activeGroup === "favorites") return prompts.filter((p) => p.isFavorite);
    return prompts; // "all" or custom group
  })();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="w-48 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="p-4 pb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Groups
          </h2>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          <button
            onClick={() => setActiveGroup("all")}
            className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${
              activeGroup === "all"
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Prompts
          </button>
          <button
            onClick={() => setActiveGroup("favorites")}
            className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${
              activeGroup === "favorites"
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ★ Favorites
          </button>
          {MOCK_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(String(g.id))}
              className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${
                activeGroup === String(g.id)
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {g.name}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => {
              clearSelection();
              // Focus editor for new prompt
            }}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            + New Prompt
          </button>
        </div>
      </aside>

      {/* ── Prompt List ── */}
      <main className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Filter prompts..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            onChange={(e) => {
              // Quick filter: just select matching prompt
              const q = e.target.value.toLowerCase();
              if (q) {
                const match = prompts.find(
                  (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.tags.some((t) => t.toLowerCase().includes(q))
                );
                if (match) selectPrompt(match.id);
              }
            }}
          />
        </div>
        <PromptList
          prompts={filteredPrompts}
          selectedId={selectedPrompt?.id ?? null}
          onSelect={(id) => {
            if (id === 0) {
              clearSelection();
            } else {
              selectPrompt(id);
            }
          }}
        />
        <div className="px-3 py-2 border-t border-gray-200 text-xs text-gray-400">
          {prompts.length} prompts
        </div>
      </main>

      {/* ── Editor ── */}
      <section className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <PromptEditor prompt={selectedPrompt} groups={MOCK_GROUPS} />
      </section>
    </div>
  );
}
