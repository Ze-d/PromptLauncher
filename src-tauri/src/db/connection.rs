use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

/// Wrapper around SQLite connection for Tauri state management.
pub struct DbState {
    pub conn: Mutex<Connection>,
}

/// Initialize the database: create directory, open connection, run migrations.
pub fn init_db(app_data_dir: &PathBuf) -> Result<DbState, Box<dyn std::error::Error>> {
    // Ensure the data directory exists
    fs::create_dir_all(app_data_dir)?;

    let db_path = app_data_dir.join("prompt-launcher.db");
    let conn = Connection::open(&db_path)?;

    // Enable WAL mode for better concurrent read performance
    conn.execute_batch("PRAGMA journal_mode=WAL;")?;
    conn.execute_batch("PRAGMA foreign_keys=ON;")?;

    super::migrations::run_migrations(&conn)?;

    Ok(DbState {
        conn: Mutex::new(conn),
    })
}
