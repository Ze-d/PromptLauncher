// ShortcutSetting.tsx — Global shortcut recording with Record button
import { useState } from "react";
import { useSettingStore } from "../../stores/settingStore";
import { useToast } from "../common/Toast";

interface Props {
  currentShortcut: string;
}

export default function ShortcutSetting({ currentShortcut }: Props) {
  const { saveSetting } = useSettingStore();
  const { showToast } = useToast();

  const [recording, setRecording] = useState(false);
  const [displayShortcut, setDisplayShortcut] = useState(currentShortcut);
  const [recordedShortcut, setRecordedShortcut] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync when parent shortcut changes (e.g. after settings reload)
  if (!recording && recordedShortcut === null && displayShortcut !== currentShortcut) {
    setDisplayShortcut(currentShortcut);
  }

  function handleRecord() {
    setRecording(true);
    setRecordedShortcut(null);
    setDisplayShortcut("Press keys...");
  }

  function handleCancel() {
    setRecording(false);
    setRecordedShortcut(null);
    setDisplayShortcut(currentShortcut);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!recording) return;
    e.preventDefault();
    e.stopPropagation();

    const keys: string[] = [];
    if (e.ctrlKey) keys.push("Ctrl");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");
    if (e.metaKey) keys.push("Meta");

    const key = e.key;
    // Ignore modifier-only presses
    if (key === "Control" || key === "Alt" || key === "Shift" || key === "Meta") return;

    keys.push(key.length === 1 ? key.toUpperCase() : key);
    const combo = keys.join("+");

    setRecordedShortcut(combo);
    setDisplayShortcut(combo);
    setRecording(false);
  }

  async function handleSave() {
    if (!recordedShortcut || recordedShortcut === currentShortcut) return;
    setSaving(true);
    try {
      await saveSetting("globalShortcut", recordedShortcut);
      showToast("Shortcut updated!");
      setRecordedShortcut(null);
    } catch {
      showToast("Failed to save shortcut", "error");
    }
    setSaving(false);
  }

  const hasChanges = recordedShortcut !== null && recordedShortcut !== currentShortcut;

  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">
        Global Shortcut
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={displayShortcut}
          onKeyDown={handleKeyDown}
          readOnly
          tabIndex={recording ? 0 : -1}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none font-mono ${
            recording
              ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }`}
        />
        {recording ? (
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={handleRecord}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Record
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 font-medium"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
