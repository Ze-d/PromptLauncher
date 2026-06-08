// App.tsx — Prompt Launcher root component
// Routes to different pages based on window label
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ToastProvider } from "../components/common/Toast";
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

  return (
    <ToastProvider>
      {Page ? <Page /> : <SettingsPage />}
    </ToastProvider>
  );
}

export default App;
