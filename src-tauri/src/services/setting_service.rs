use rusqlite::Connection;
use crate::errors::AppError;
use crate::models::AppSettingsDto;
use crate::services::prompt_service::now_iso;

/// Load all settings from DB, returning defaults for missing keys.
pub fn get_settings(conn: &Connection) -> Result<AppSettingsDto, AppError> {
    let defaults = AppSettingsDto::default();

    let mut stmt = conn
        .prepare("SELECT key, value FROM settings")
        .map_err(|e| AppError::Database(e.to_string()))?;

    let rows: Vec<(String, String)> = stmt
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))
        .map_err(|e| AppError::Database(e.to_string()))?
        .filter_map(|r| r.ok())
        .collect();

    let mut settings = defaults;
    for (key, value) in rows {
        match key.as_str() {
            "global_shortcut" => settings.global_shortcut = value,
            "theme" => settings.theme = value,
            "default_action" => settings.default_action = value,
            "close_to_tray" => settings.close_to_tray = value == "true",
            "auto_start" => settings.auto_start = value == "true",
            "quick_window_width" => {
                if let Ok(v) = value.parse() { settings.quick_window_width = v; }
            }
            "quick_window_height" => {
                if let Ok(v) = value.parse() { settings.quick_window_height = v; }
            }
            _ => {}
        }
    }

    Ok(settings)
}

/// Update a single setting value (upsert).
pub fn update_setting(conn: &Connection, key: &str, value: &str) -> Result<(), AppError> {
    let now = now_iso();
    conn.execute(
        "INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = ?3",
        rusqlite::params![key, value, now],
    )
    .map_err(|e| AppError::Database(e.to_string()))?;
    Ok(())
}
