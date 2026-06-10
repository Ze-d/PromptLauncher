// FilterBar.tsx — Search filter input + settings entry
import type { Prompt } from "../../types/prompt";

interface Props {
  prompts: Prompt[];
  onFilterMatch: (id: number) => void;
  onSettingsClick: () => void;
  totalCount: number;
}

export default function FilterBar({
  prompts,
  onFilterMatch,
  onSettingsClick,
  totalCount,
}: Props) {
  return (
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
                p.tags.some((t) => t.toLowerCase().includes(q)),
            );
            if (match) onFilterMatch(match.id);
          }
        }}
      />
      <button
        onClick={onSettingsClick}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-lg"
        title="Settings"
      >
        ⚙
      </button>
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
        {totalCount}
      </span>
    </div>
  );
}
