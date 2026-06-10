// MainPage.tsx — Prompt management (CRUD) page
// Layout: sidebar (groups) | prompt list | prompt editor
import { useEffect, useState, useRef } from "react";
import { usePromptStore } from "../stores/promptStore";
import { useGroupStore } from "../stores/groupStore";
import PromptList from "../components/prompt/PromptList";
import PromptEditor from "../components/prompt/PromptEditor";
import SettingsModal from "../components/settings/SettingsModal";
import type { Group } from "../types/prompt";

export default function MainPage() {
  const { prompts, selectedPrompt, loadPrompts, selectPrompt, clearSelection } =
    usePromptStore();
  const { groups, loadGroups, createGroup, updateGroup, deleteGroup } =
    useGroupStore();

  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [addingGroup, setAddingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPrompts();
    loadGroups();
  }, [loadPrompts, loadGroups]);

  useEffect(() => {
    if (addingGroup && addInputRef.current) {
      addInputRef.current.focus();
    }
    if (editingGroupId !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [addingGroup, editingGroupId]);

  const filteredPrompts = (() => {
    // Sort: favorites first, then by updated_at DESC within each group
    const sorted = [...prompts].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    if (activeGroup === "favorites") return sorted.filter((p) => p.isFavorite);
    if (activeGroup === "recent") {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return sorted.filter(
        (p) => p.lastUsedAt && new Date(p.lastUsedAt).getTime() > cutoff,
      );
    }
    // Custom group: filter by group_id
    const gid = Number(activeGroup);
    if (!isNaN(gid)) return sorted.filter((p) => p.groupId === gid);
    return sorted; // "all"
  })();

  // ── Group actions ──

  async function handleAddGroup() {
    const name = groupNameInput.trim();
    if (!name) {
      setAddingGroup(false);
      setGroupNameInput("");
      return;
    }
    try {
      const g = await createGroup({ name });
      setActiveGroup(String(g.id));
    } catch {
      // error handled by store
    }
    setAddingGroup(false);
    setGroupNameInput("");
  }

  async function handleEditGroup(group: Group) {
    if (editingGroupId === group.id) {
      // Save
      const name = groupNameInput.trim();
      if (name && name !== group.name) {
        try {
          await updateGroup({ id: group.id, name });
        } catch {
          // error handled by store
        }
      }
      setEditingGroupId(null);
      setGroupNameInput("");
    } else {
      // Start editing
      setEditingGroupId(group.id);
      setGroupNameInput(group.name);
    }
  }

  async function handleDeleteGroup(group: Group) {
    if (!confirm(`Delete group "${group.name}"? Prompts in this group will be ungrouped.`)) return;
    try {
      await deleteGroup(group.id);
      if (activeGroup === String(group.id)) {
        setActiveGroup("all");
      }
    } catch {
      // error handled by store
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* ── Sidebar ── */}
      <aside className="w-48 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shrink-0">
        <div className="p-4 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Groups
          </h2>
          <button
            onClick={() => {
              setAddingGroup(!addingGroup);
              setGroupNameInput("");
            }}
            className="text-gray-400 dark:text-gray-500 hover:text-blue-600 text-lg leading-none px-1"
            title="Add group"
          >
            +
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          <button
            onClick={() => setActiveGroup("all")}
            className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${
              activeGroup === "all"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            All Prompts
          </button>
          <button
            onClick={() => setActiveGroup("favorites")}
            className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${
              activeGroup === "favorites"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            ★ Favorites
          </button>
          <button
            onClick={() => setActiveGroup("recent")}
            className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${
              activeGroup === "recent"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            🕐 Recent
          </button>

          {/* Custom groups */}
          {groups.map((g) => (
            <div
              key={g.id}
              className={`group flex items-center rounded-md ${
                activeGroup === String(g.id)
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {editingGroupId === g.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  onBlur={() => handleEditGroup(g)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditGroup(g);
                    if (e.key === "Escape") {
                      setEditingGroupId(null);
                      setGroupNameInput("");
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 border border-blue-300 rounded outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <button
                    onClick={() => setActiveGroup(String(g.id))}
                    className="flex-1 text-left px-3 py-1.5 text-sm truncate"
                  >
                    {g.name}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditGroup(g);
                    }}
                    className="hidden group-hover:block px-1 text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600"
                    title="Rename group"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(g);
                    }}
                    className="hidden group-hover:block px-1 text-xs text-gray-400 dark:text-gray-500 hover:text-red-600"
                    title="Delete group"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}

          {/* Add group inline input */}
          {addingGroup && (
            <div className="px-2 pt-1">
              <input
                ref={addInputRef}
                type="text"
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                onBlur={handleAddGroup}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddGroup();
                  if (e.key === "Escape") {
                    setAddingGroup(false);
                    setGroupNameInput("");
                  }
                }}
                placeholder="Group name…"
                className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-500 rounded outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              clearSelection();
            }}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            + New Prompt
          </button>
        </div>
      </aside>

      {/* ── Prompt List ── */}
      <main className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter prompts..."
            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-gray-100 dark:placeholder-gray-400"
            onChange={(e) => {
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
          <button
            onClick={() => setSettingsOpen(true)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-lg"
            title="Settings"
          >
            ⚙
          </button>
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
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
          {prompts.length} prompts
        </div>
      </main>

      {/* ── Editor ── */}
      <section className="flex-1 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
        <PromptEditor prompt={selectedPrompt} groups={groups} />
      </section>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
