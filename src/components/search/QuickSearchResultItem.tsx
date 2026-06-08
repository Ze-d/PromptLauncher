// QuickSearchResultItem.tsx — Single search result row
import type { Prompt } from "../../types/prompt";

interface Props {
  prompt: Prompt;
  isSelected: boolean;
  onSelect: () => void;
}

export default function QuickSearchResultItem({ prompt, isSelected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
        isSelected
          ? "bg-blue-600/30 border border-blue-500/50"
          : "hover:bg-gray-800 border border-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-100">
          {prompt.isFavorite && <span className="mr-1 text-yellow-400">★</span>}
          {prompt.title || (
            <span className="italic text-gray-500">Untitled</span>
          )}
        </span>
        <span className="text-xs text-gray-500">×{prompt.usageCount}</span>
      </div>
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs rounded bg-gray-800 text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {prompt.description && (
        <p className="text-xs text-gray-500 mt-1 truncate">
          {prompt.description}
        </p>
      )}
    </button>
  );
}
