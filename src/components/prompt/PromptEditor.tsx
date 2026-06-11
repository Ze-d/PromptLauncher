// PromptEditor.tsx — Prompt edit/create form
import { useState, useEffect, type FormEvent } from "react";
import type { Prompt, CreatePromptInput, UpdatePromptInput } from "../../types/prompt";
import TagInput from "./TagInput";
import GroupSelect from "./GroupSelect";
import { usePromptStore } from "../../stores/promptStore";
import { copyPromptToClipboard } from "../../services/clipboardApi";
import { useToast } from "../common/Toast";

interface Props {
  prompt: Prompt | null; // null = create new
  groups: { id: number; name: string }[];
}

export default function PromptEditor({ prompt, groups }: Props) {
  const { createPrompt, updatePrompt, deletePrompt, clearSelection } = usePromptStore();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setDescription(prompt.description ?? "");
      setTags(prompt.tags);
      setGroupId(prompt.groupId ?? null);
      setIsFavorite(prompt.isFavorite);
    } else {
      setTitle("");
      setContent("");
      setDescription("");
      setTags([]);
      setGroupId(null);
      setIsFavorite(false);
    }
  }, [prompt]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      if (prompt) {
        const input: UpdatePromptInput = {
          id: prompt.id,
          title: title.trim(),
          content: content.trim(),
          description: description.trim() || undefined,
          groupId: groupId ?? undefined,
          tags,
          isFavorite,
        };
        await updatePrompt(input);
      } else {
        const input: CreatePromptInput = {
          title: title.trim(),
          content: content.trim(),
          description: description.trim() || undefined,
          groupId: groupId ?? undefined,
          tags,
          isFavorite,
        };
        await createPrompt(input);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    if (!prompt) return;
    try {
      await copyPromptToClipboard(prompt.id);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Copy failed", "error");
    }
  }

  async function handleDelete() {
    if (!prompt) return;
    if (!confirm("Delete this prompt?")) return;
    await deletePrompt(prompt.id);
  }

  const inputClass = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-gray-100";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <form onSubmit={handleSave} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {prompt ? "Edit Prompt" : "New Prompt"}
        </h2>
        <div className="flex gap-2">
          {prompt && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                Delete
              </button>
            </>
          )}
          <button
            type="button"
            onClick={clearSelection}
            className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Form fields — flex column so the textarea fills remaining space */}
      <div className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Title */}
        <div className="shrink-0">
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Prompt title"
            className={inputClass}
            autoFocus
          />
        </div>

        {/* Content — fills remaining vertical space */}
        <div className="flex-1 flex flex-col min-h-[60px]">
          <label className={labelClass}>Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Prompt content — this is what gets copied"
            className={`${inputClass} flex-1 resize-y font-mono min-h-0`}
          />
        </div>

        {/* Description */}
        <div className="shrink-0">
          <label className={labelClass}>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional short description"
            className={inputClass}
          />
        </div>

        {/* Tags */}
        <div className="shrink-0">
          <label className={labelClass}>Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Group + Favorite row */}
        <div className="shrink-0 flex gap-4">
          <div className="flex-1">
            <label className={labelClass}>Group</label>
            <GroupSelect value={groupId} onChange={setGroupId} groups={groups} />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">★ Favorite</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
