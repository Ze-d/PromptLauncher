use tauri::{AppHandle, State};
use crate::db::DbState;
use crate::errors::AppError;
use crate::models::AppSettingsDto;
use crate::services::{setting_service, shortcut_service};

#[tauri::command]
pub async fn get_settings(
    db: State<'_, DbState>,
) -> Result<AppSettingsDto, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    setting_service::get_settings(&conn)
}

#[tauri::command]
pub async fn update_setting(
    db: State<'_, DbState>,
    app: AppHandle,
    key: String,
    value: String,
) -> Result<(), AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    setting_service::update_setting(&conn, &key, &value)?;

    // If shortcut changed, re-register
    if key == "global_shortcut" {
        if let Err(e) = shortcut_service::register_shortcut(&app, &value) {
            eprintln!("Warning: failed to re-register shortcut '{}': {}", value, e);
        }
    }

    Ok(())
}
