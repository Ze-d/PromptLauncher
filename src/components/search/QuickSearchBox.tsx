// QuickSearchBox.tsx — Search input for quick-search window
import { useEffect, useRef } from "react";

interface Props {
  query: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  onEscape: () => void;
  loading: boolean;
}

export default function QuickSearchBox({
  query,
  onChange,
  onEnter,
  onArrowUp,
  onArrowDown,
  onEscape,
  loading,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Re-focus on window show
  useEffect(() => {
    function handleFocus() {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="relative px-4 pt-4 pb-2">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onArrowDown();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            onArrowUp();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onEscape();
          }
        }}
        placeholder="Search prompts..."
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-lg text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      {loading && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-blue-400" />
        </div>
      )}
    </div>
  );
}
