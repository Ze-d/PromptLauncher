use tauri::{AppHandle, State};
use crate::db::DbState;
use crate::errors::AppError;
use crate::services::{clipboard_service, prompt_service};

#[tauri::command]
pub async fn copy_to_clipboard(app: AppHandle, text: String) -> Result<(), AppError> {
    clipboard_service::copy_to_clipboard(&app, &text)
}

/// Copy a prompt's content to clipboard and mark it as used.
#[tauri::command]
pub async fn copy_prompt_to_clipboard(
    app: AppHandle,
    db: State<'_, DbState>,
    id: i64,
) -> Result<(), AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;

    // Get prompt content
    let prompt = prompt_service::get_prompt(&conn, id)?;

    // Copy to clipboard
    clipboard_service::copy_to_clipboard(&app, &prompt.content)?;

    // Mark as used
    prompt_service::mark_prompt_used(&conn, id)?;

    Ok(())
}
