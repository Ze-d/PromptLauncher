// ResizeHandle.tsx — Draggable vertical resize handle between panels
import { useRef, useCallback } from "react";

interface Props {
  onResize: (delta: number) => void;
  disabled?: boolean;
}

const BASE_CLASS =
  "w-1 cursor-col-resize bg-transparent hover:bg-blue-400 dark:hover:bg-blue-500 active:bg-blue-500 dark:active:bg-blue-400 transition-colors shrink-0";
const DISABLED_CLASS = "w-1 bg-transparent shrink-0";

export default function ResizeHandle({ onResize, disabled }: Props) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      dragging.current = true;
      lastX.current = e.clientX;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - lastX.current;
      lastX.current = e.clientX;
      onResize(delta);
    },
    [onResize],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      className={disabled ? DISABLED_CLASS : BASE_CLASS}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={undefined}
    />
  );
}
