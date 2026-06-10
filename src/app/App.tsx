// App.tsx — Prompt Launcher root component
// Routes to different pages based on window label
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ToastProvider } from "../components/common/Toast";
import { useSettingStore } from "../stores/settingStore";
import MainPage from "../pages/MainPage";
import QuickSearchPage from "../pages/QuickSearchPage";
import SettingsPage from "../pages/SettingsPage";

const WINDOW_PAGES: Record<string, React.ComponentType> = {
  "main": MainPage,
  "quick-search": QuickSearchPage,
};

function App() {
  const label = getCurrentWindow().label;
  const Page = WINDOW_PAGES[label];

  // ── Theme activation ──
  const theme = useSettingStore((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(mode: "light" | "dark") {
      if (mode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    if (theme === "dark") {
      applyTheme("dark");
    } else if (theme === "light") {
      applyTheme("light");
    } else {
      // system
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches ? "dark" : "light");
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  return (
    <ToastProvider>
      {Page ? <Page /> : <SettingsPage />}
    </ToastProvider>
  );
}

export default App;
