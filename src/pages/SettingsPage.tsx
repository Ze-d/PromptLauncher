// SettingsPage.tsx — Application settings page
import { useEffect, useRef, useState } from "react";
import { useSettingStore } from "../stores/settingStore";
import { useToast } from "../components/common/Toast";
import {
  exportToJson,
  importFromJson,
  downloadJson,
  readFileAsText,
  type ImportResult,
} from "../services/importExportApi";
import type { Theme } from "../types/setting";

export default function SettingsPage() {
  const { settings, loading, loadSettings, saveSetting } = useSettingStore();
  const { showToast } = useToast();

  const [shortcut, setShortcut] = useState(settings.globalShortcut);
  const [recording, setRecording] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setShortcut(settings.globalShortcut);
  }, [settings.globalShortcut]);

  async function handleShortcutRecord(e: React.KeyboardEvent) {
    if (!recording) return;
    e.preventDefault();

    const keys: string[] = [];
    if (e.ctrlKey) keys.push("Ctrl");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");
    if (e.metaKey) keys.push("Meta");

    const key = e.key;
    if (key === "Control" || key === "Alt" || key === "Shift" || key === "Meta") return;

    keys.push(key.length === 1 ? key.toUpperCase() : key);
    const combo = keys.join("+");
    setShortcut(combo);
    setRecording(false);
  }

  async function handleSaveShortcut() {
    if (shortcut !== settings.globalShortcut) {
      await saveSetting("globalShortcut", shortcut);
      showToast("Shortcut updated!");
    }
  }

  async function handleThemeChange(theme: Theme) {
    await saveSetting("theme", theme);
    showToast("Theme updated");
  }

  async function handleExport() {
    try {
      const json = await exportToJson();
      const now = new Date().toISOString().slice(0, 10);
      downloadJson(`prompt-launcher-export-${now}.json`, json);
      showToast("Exported!");
    } catch {
      showToast("Export failed", "error");
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const result = await importFromJson(text);
      setImportResult(result);
      if (result.imported > 0) showToast(`Imported ${result.imported} prompts!`);
      else showToast("Nothing imported", "error");
    } catch (err) {
      showToast("Import failed: invalid file", "error");
    }
    // Reset input so the same file can be re-imported
    if (fileRef.current) fileRef.current.value = "";
  }

  if (loading && settings.globalShortcut === "") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 max-w-2xl mx-auto py-8 px-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Settings</h1>

        {/* Shortcut */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Global Shortcut
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="text-xs text-gray-500 mb-1 block">
              Press keys to record a new shortcut
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={recording ? "Press keys..." : shortcut}
                onFocus={() => setRecording(true)}
                onBlur={() => setRecording(false)}
                onKeyDown={handleShortcutRecord}
                readOnly
                className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none font-mono ${
                  recording
                    ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              />
              <button
                onClick={handleSaveShortcut}
                disabled={shortcut === settings.globalShortcut}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Theme
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex gap-2">
              {(["system", "light", "dark"] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`px-4 py-2 text-sm rounded-lg capitalize ${
                    settings.theme === t
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Behavior */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Behavior
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
              <div>
                <span className="text-sm text-gray-700">Close to tray</span>
                <p className="text-xs text-gray-400">Hide main window instead of closing</p>
              </div>
              <input
                type="checkbox"
                checked={settings.closeToTray}
                onChange={async (e) => {
                  await saveSetting("closeToTray", e.target.checked);
                }}
                className="rounded border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
              <div>
                <span className="text-sm text-gray-700">Auto-start on boot</span>
                <p className="text-xs text-gray-400">Launch Prompt Launcher when Windows starts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoStart}
                onChange={async (e) => {
                  await saveSetting("autoStart", e.target.checked);
                }}
                className="rounded border-gray-300"
              />
            </label>
          </div>
        </section>

        {/* Data */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Data
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs text-gray-400">
              All prompts are stored locally at:
            </p>
            <p className="text-sm text-gray-600 font-mono select-all">
              %APPDATA%/PromptLauncher/prompt-launcher.db
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Export JSON
              </button>
              <label className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer">
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </div>
            {importResult && (
              <div className="text-xs p-2 rounded bg-gray-50 border border-gray-200">
                {importResult.total} total, {importResult.imported} imported
                {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
                {importResult.errors.map((e, i) => (
                  <p key={i} className="text-red-500 mt-0.5">{e}</p>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
