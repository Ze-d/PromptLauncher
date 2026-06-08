use rusqlite::Connection;

/// Run all migrations. Each migration is idempotent (IF NOT EXISTS).
pub fn run_migrations(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    conn.execute_batch(
        "
        -- Groups
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        -- Prompts
        CREATE TABLE IF NOT EXISTS prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            description TEXT,
            group_id INTEGER,
            is_favorite INTEGER NOT NULL DEFAULT 0,
            usage_count INTEGER NOT NULL DEFAULT 0,
            last_used_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (group_id) REFERENCES groups(id)
        );

        -- Tags
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        );

        -- Prompt-Tag junction (many-to-many)
        CREATE TABLE IF NOT EXISTS prompt_tags (
            prompt_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (prompt_id, tag_id),
            FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );

        -- Settings (key-value store)
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        -- Usage logs
        CREATE TABLE IF NOT EXISTS usage_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
        );

        -- Indexes for common queries
        CREATE INDEX IF NOT EXISTS idx_prompts_title ON prompts(title);
        CREATE INDEX IF NOT EXISTS idx_prompts_group_id ON prompts(group_id);
        CREATE INDEX IF NOT EXISTS idx_prompts_is_favorite ON prompts(is_favorite);
        CREATE INDEX IF NOT EXISTS idx_prompts_last_used_at ON prompts(last_used_at);
        CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
        ",
    )?;

    Ok(())
}
