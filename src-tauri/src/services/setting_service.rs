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
            "sidebar_ratio" => {
                if let Ok(v) = value.parse() { settings.sidebar_ratio = v; }
            }
            "list_ratio" => {
                if let Ok(v) = value.parse() { settings.list_ratio = v; }
            }
            "sidebar_collapsed" => {
                settings.sidebar_collapsed = value == "true";
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};

    static DB_COUNTER: AtomicU32 = AtomicU32::new(0);

    fn setup_db() -> Connection {
        let n = DB_COUNTER.fetch_add(1, Ordering::SeqCst);
        let tmp = std::env::temp_dir().join(format!("test_setting_{}_{}.db", std::process::id(), n));
        let conn = Connection::open(&tmp).unwrap();
        crate::db::migrations::run_migrations(&conn).unwrap();
        conn
    }

    #[test]
    fn test_get_settings_returns_defaults() {
        let conn = setup_db();
        let settings = get_settings(&conn).unwrap();
        // Default shortcut
        assert_eq!(settings.global_shortcut, "Ctrl+Alt+Space");
    }

    #[test]
    fn test_update_and_get_setting() {
        let conn = setup_db();

        update_setting(&conn, "theme", "dark").unwrap();
        let settings = get_settings(&conn).unwrap();
        assert_eq!(settings.theme, "dark");
    }

    #[test]
    fn test_update_multiple_settings() {
        let conn = setup_db();

        update_setting(&conn, "theme", "light").unwrap();
        update_setting(&conn, "close_to_tray", "false").unwrap();
        update_setting(&conn, "quick_window_width", "800").unwrap();

        let settings = get_settings(&conn).unwrap();
        assert_eq!(settings.theme, "light");
        assert!(!settings.close_to_tray);
        assert_eq!(settings.quick_window_width, 800);
    }

    #[test]
    fn test_update_setting_upsert() {
        let conn = setup_db();

        // First write
        update_setting(&conn, "theme", "dark").unwrap();
        // Overwrite
        update_setting(&conn, "theme", "light").unwrap();

        let settings = get_settings(&conn).unwrap();
        assert_eq!(settings.theme, "light");
    }

    #[test]
    fn test_boolean_setting_parsing() {
        let conn = setup_db();

        update_setting(&conn, "auto_start", "true").unwrap();
        let settings = get_settings(&conn).unwrap();
        assert!(settings.auto_start);

        update_setting(&conn, "auto_start", "false").unwrap();
        let settings = get_settings(&conn).unwrap();
        assert!(!settings.auto_start);
    }

    #[test]
    fn test_invalid_numeric_setting_falls_back_to_default() {
        let conn = setup_db();

        // Directly insert invalid value to test fallback
        let now = now_iso();
        conn.execute(
            "INSERT INTO settings (key, value, updated_at) VALUES ('quick_window_width', 'not_a_number', ?1)",
            rusqlite::params![now],
        ).unwrap();

        let settings = get_settings(&conn).unwrap();
        // Should fall back to default since parse fails
        assert!(settings.quick_window_width > 0);
    }
}
