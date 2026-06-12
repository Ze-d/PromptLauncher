// useResizableColumns.ts — Proportional column widths with ResizeObserver
// Stores ratios (percentages) in settings table; converts to pixels based on container width.
// All three panels scale proportionally when the window resizes.
import { useState, useCallback, useRef, useEffect } from "react";
import { useSettingStore } from "../stores/settingStore";

const MIN_SIDEBAR_PX = 140;
const MIN_LIST_PX = 180;
const COLLAPSED_SIDEBAR_PX = 48;
const DEFAULT_SIDEBAR_RATIO = 18;
const DEFAULT_LIST_RATIO = 27;
const PERSIST_DELAY = 300;

export interface ResizableColumns {
  /** Ref to attach to the flex container */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Actual rendered sidebar width in px */
  sidebarWidth: number;
  /** Actual rendered list width in px */
  listWidth: number;
  /** Whether sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Drag handler: sidebar–list resizer */
  resizeSidebar: (delta: number) => void;
  /** Drag handler: list–editor resizer */
  resizeList: (delta: number) => void;
  /** Toggle sidebar collapsed / expanded */
  toggleSidebar: () => void;
}

export function useResizableColumns(): ResizableColumns {
  const settings = useSettingStore((s) => s.settings);
  const saveSetting = useSettingStore((s) => s.saveSetting);
  const loaded = useSettingStore((s) => s.loading === false);

  // ── Container ref for ResizeObserver ──
  const containerRef = useRef<HTMLDivElement>(null!);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    // Set initial width
    setContainerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // ── Ratio state (percentage integers, e.g. 18 = 18%) ──
  const [sidebarRatio, setSidebarRatio] = useState(() =>
    settings.sidebarRatio > 0 ? settings.sidebarRatio : DEFAULT_SIDEBAR_RATIO,
  );
  const [listRatio, setListRatio] = useState(() =>
    settings.listRatio > 0 ? settings.listRatio : DEFAULT_LIST_RATIO,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => settings.sidebarCollapsed,
  );

  // Sync from settings on first load
  useEffect(() => {
    if (loaded) {
      if (settings.sidebarRatio > 0) setSidebarRatio(settings.sidebarRatio);
      if (settings.listRatio > 0) setListRatio(settings.listRatio);
      setSidebarCollapsed(settings.sidebarCollapsed);
    }
  }, [loaded, settings.sidebarRatio, settings.listRatio, settings.sidebarCollapsed]);

  // ── Persist debounce ──
  const sidebarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistSidebar = useCallback(
    (r: number) => {
      if (sidebarTimer.current) clearTimeout(sidebarTimer.current);
      sidebarTimer.current = setTimeout(() => saveSetting("sidebarRatio", r), PERSIST_DELAY);
    },
    [saveSetting],
  );

  const persistList = useCallback(
    (r: number) => {
      if (listTimer.current) clearTimeout(listTimer.current);
      listTimer.current = setTimeout(() => saveSetting("listRatio", r), PERSIST_DELAY);
    },
    [saveSetting],
  );

  // ── Ratio → pixel conversion ──
  // Subtract 2×4px for the two resize handles
  const availableWidth = Math.max(0, containerWidth - 8);
  const sidebarPx = sidebarCollapsed
    ? COLLAPSED_SIDEBAR_PX
    : Math.round(availableWidth * sidebarRatio / 100);
  const listPx = Math.round(availableWidth * listRatio / 100);

  // ── Resize handlers: pixel delta → ratio delta ──
  const resizeSidebar = useCallback(
    (delta: number) => {
      if (sidebarCollapsed || availableWidth <= 0) return;
      const deltaRatio = Math.round((delta / availableWidth) * 100);
      if (deltaRatio === 0 && delta !== 0) {
        // If delta is too small to change ratio by 1%, accumulate it
        // Use a smaller effective change
        const sign = delta > 0 ? 1 : -1;
        setSidebarRatio((prev) => {
          const next = prev + sign;
          // Don't let list get squeezed below its minimum
          const minListRatio = Math.round((MIN_LIST_PX / availableWidth) * 100);
          if (prev + listRatio - next < minListRatio) return prev;
          return Math.max(1, next);
        });
        return;
      }
      setSidebarRatio((prev) => {
        const next = prev + deltaRatio;
        // Ensure list doesn't go below min px
        const minListRatio = Math.round((MIN_LIST_PX / availableWidth) * 100);
        if (prev + listRatio - next < minListRatio) return prev;
        persistSidebar(next);
        return Math.max(1, next);
      });
    },
    [sidebarCollapsed, availableWidth, listRatio, persistSidebar],
  );

  const resizeList = useCallback(
    (delta: number) => {
      if (availableWidth <= 0) return;
      setListRatio((prev) => {
        const deltaRatio = Math.round((delta / availableWidth) * 100);
        if (deltaRatio === 0 && delta !== 0) {
          // Tiny delta — use 1% step
          const sign = delta > 0 ? 1 : -1;
          const next = prev + sign;
          // Don't let editor get squeezed below reasonable minimum (~15%)
          const maxListForEditor = 100 - sidebarRatio - 15;
          if (sidebarCollapsed && next > maxListForEditor + sidebarRatio) return prev;
          if (!sidebarCollapsed && next > maxListForEditor) return prev;
          // Don't let sidebar get squeezed
          const minSidebarRatio = Math.round((MIN_SIDEBAR_PX / availableWidth) * 100);
          if (!sidebarCollapsed && sidebarRatio + prev - next < minSidebarRatio) return prev;
          return Math.max(1, next);
        }
        const next = prev + deltaRatio;
        // Clamp: list must stay ≥ min px, and editor gets at least ~15%
        const minListRatio = Math.round((MIN_LIST_PX / availableWidth) * 100);
        const maxListRatio = 100 - sidebarRatio - 15; // Leave at least 15% for editor
        const clamped = Math.min(Math.max(next, minListRatio), maxListRatio);
        persistList(clamped);
        return clamped;
      });
    },
    [availableWidth, sidebarRatio, sidebarCollapsed, persistList],
  );

  // ── Toggle ──
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      saveSetting("sidebarCollapsed", next);
      return next;
    });
  }, [saveSetting]);

  return {
    containerRef,
    sidebarWidth: sidebarPx,
    listWidth: listPx,
    sidebarCollapsed,
    resizeSidebar,
    resizeList,
    toggleSidebar,
  };
}
