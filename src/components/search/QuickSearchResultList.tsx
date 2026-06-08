// QuickSearchResultList.tsx — Search results container
import type { Prompt } from "../../types/prompt";
import QuickSearchResultItem from "./QuickSearchResultItem";

interface Props {
  results: Prompt[];
  selectedIndex: number;
  query: string;
  onSelect: (prompt: Prompt) => void;
}

export default function QuickSearchResultList({
  results,
  selectedIndex,
  query,
  onSelect,
}: Props) {
  if (results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <p className="text-sm text-gray-500 text-center">
          {query.length > 0 ? "No prompts found." : "Type to search your prompts..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
      {results.map((p, i) => (
        <QuickSearchResultItem
          key={p.id}
          prompt={p}
          isSelected={i === selectedIndex}
          onSelect={() => onSelect(p)}
        />
      ))}
    </div>
  );
}
