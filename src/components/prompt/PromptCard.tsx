// PromptCard.tsx — Single prompt list item
import type { Prompt } from "../../types/prompt";

interface Props {
  prompt: Prompt;
  isSelected: boolean;
  onSelect: () => void;
}

export default function PromptCard({ prompt, isSelected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
          : "hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {prompt.isFavorite && <span className="mr-1 text-yellow-500">★</span>}
          {prompt.title || <span className="italic text-gray-400 dark:text-gray-500">Untitled</span>}
        </h3>
        {prompt.usageCount > 0 && (
          <span className="text-xs text-gray-400 whitespace-nowrap">
            ×{prompt.usageCount}
          </span>
        )}
      </div>
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {prompt.description && (
        <p className="text-xs text-gray-500 mt-1 truncate">{prompt.description}</p>
      )}
    </button>
  );
}
