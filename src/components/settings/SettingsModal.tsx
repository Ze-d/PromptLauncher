// SettingsModal.tsx — Settings modal with shortcut recording + data import/export
import { useRef, useState } from "react";
import { useSettingStore } from "../../stores/settingStore";
import { usePromptStore } from "../../stores/promptStore";
import { useGroupStore } from "../../stores/groupStore";
import { useToast } from "../common/Toast";
import ShortcutSetting from "./ShortcutSetting";
import {
  exportToJson,
  importFromJson,
  downloadJson,
  readFileAsText,
  type ImportResult,
} from "../../services/importExportApi";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: Props) {
  const { settings } = useSettingStore();
  const { loadPrompts } = usePromptStore();
  const { loadGroups } = useGroupStore();
  const { showToast } = useToast();

  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

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
      if (result.imported > 0) {
        showToast(
          `Imported ${result.imported} prompts, ${result.groupsImported} groups, ${result.tagsImported} tags!`,
        );
        loadPrompts();
        loadGroups();
      } else {
        showToast("Nothing imported", "error");
      }
    } catch {
      showToast("Import failed: invalid file", "error");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md mx-4 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Section: Shortcut */}
        <div className="border-t border-gray-100 pt-4">
          <ShortcutSetting currentShortcut={settings.globalShortcut} />
        </div>

        {/* Section: Data */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Data
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            All data stored locally at:
          </p>
          <p className="text-xs text-gray-600 font-mono select-all mb-3">
            %APPDATA%/PromptLauncher/prompt-launcher.db
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Export JSON
            </button>
            <label className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer">
              Import JSON
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
          {importResult && (
            <div className="mt-3 text-xs p-2 rounded bg-gray-50 border border-gray-200">
              {importResult.total} total, {importResult.imported} prompts imported
              {importResult.groupsImported > 0 &&
                `, ${importResult.groupsImported} groups`}
              {importResult.tagsImported > 0 &&
                `, ${importResult.tagsImported} tags`}
              {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
              {importResult.errors.map((e, i) => (
                <p key={i} className="text-red-500 mt-0.5">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
