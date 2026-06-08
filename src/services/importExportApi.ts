// importExportApi.ts — Tauri invoke wrappers for import/export
import { invoke } from "@tauri-apps/api/core";

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export async function exportToJson(): Promise<string> {
  return invoke("export_prompts_to_json");
}

export async function importFromJson(json: string): Promise<ImportResult> {
  return invoke("import_prompts_from_json", { json });
}

/// Trigger a file download in the browser
export function downloadJson(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/// Read a file from an HTML file input
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
