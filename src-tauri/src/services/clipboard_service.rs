use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;
use crate::errors::AppError;

/// Copy text to the system clipboard.
pub fn copy_to_clipboard(app: &AppHandle, text: &str) -> Result<(), AppError> {
    app.clipboard()
        .write_text(text.to_string())
        .map_err(|e| AppError::Clipboard(e.to_string()))
}
