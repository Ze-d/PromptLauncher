// PromptList.tsx — Scrollable prompt list with keyboard navigation
import { useEffect } from "react";
import type { Prompt } from "../../types/prompt";
import PromptCard from "./PromptCard";

interface Props {
  prompts: Prompt[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function PromptList({ prompts, selectedId, onSelect }: Props) {
  // Keyboard navigation: Ctrl+N to create new
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        onSelect(0); // 0 = create new
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelect]);

  if (prompts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-gray-400 text-center">
          No prompts yet.
          <br />
          <span className="text-xs">Ctrl+N to create one</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {prompts.map((p) => (
        <PromptCard
          key={p.id}
          prompt={p}
          isSelected={selectedId === p.id}
          onSelect={() => onSelect(p.id)}
        />
      ))}
    </div>
  );
}
