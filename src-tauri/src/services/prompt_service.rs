use rusqlite::Connection;
use crate::errors::AppError;
use crate::models::*;

/// Create a new prompt with optional tags and group.
pub fn create_prompt(conn: &Connection, input: CreatePromptInput) -> Result<PromptDto, AppError> {
    let now = now_iso();

    conn.execute(
        "INSERT INTO prompts (title, content, description, group_id, is_favorite, usage_count, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?6)",
        rusqlite::params![
            input.title,
            input.content,
            input.description,
            input.group_id,
            input.is_favorite.unwrap_or(false) as i64,
            now,
        ],
    ).map_err(|e| AppError::Database(e.to_string()))?;

    let id = conn.last_insert_rowid();

    // Handle tags
    if let Some(ref tags) = input.tags {
        sync_tags(conn, id, tags)?;
    }

    get_prompt(conn, id)
}

/// Update an existing prompt.
pub fn update_prompt(conn: &Connection, input: UpdatePromptInput) -> Result<PromptDto, AppError> {
    let now = now_iso();

    // Build update dynamically based on which fields are provided
    let mut sets: Vec<String> = vec!["updated_at = ?1".into()];
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = vec![Box::new(now.clone())];

    if let Some(ref title) = input.title {
        sets.push(format!("title = ?{}", sets.len() + 1));
        params.push(Box::new(title.clone()));
    }
    if let Some(ref content) = input.content {
        sets.push(format!("content = ?{}", sets.len() + 1));
        params.push(Box::new(content.clone()));
    }
    if let Some(ref description) = input.description {
        sets.push(format!("description = ?{}", sets.len() + 1));
        params.push(Box::new(description.clone()));
    }
    if let Some(group_id) = input.group_id {
        sets.push(format!("group_id = ?{}", sets.len() + 1));
        params.push(Box::new(group_id));
    }
    if let Some(is_favorite) = input.is_favorite {
        sets.push(format!("is_favorite = ?{}", sets.len() + 1));
        params.push(Box::new(is_favorite as i64));
    }

    let set_clause = sets.join(", ");
    let sql = format!("UPDATE prompts SET {} WHERE id = ?{}", set_clause, sets.len() + 1);
    params.push(Box::new(input.id));

    let affected = conn.execute(&sql, rusqlite::params_from_iter(params.iter().map(|p| p.as_ref()))).map_err(|e| AppError::Database(e.to_string()))?;
    if affected == 0 {
        return Err(AppError::NotFound(format!("Prompt {} not found", input.id)));
    }

    // Handle tags if provided
    if let Some(ref tags) = input.tags {
        sync_tags(conn, input.id, tags)?;
    }

    get_prompt(conn, input.id)
}

/// Delete a prompt by id (cascades to prompt_tags and usage_logs).
pub fn delete_prompt(conn: &Connection, id: i64) -> Result<(), AppError> {
    let affected = conn
        .execute("DELETE FROM prompts WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| AppError::Database(e.to_string()))?;
    if affected == 0 {
        return Err(AppError::NotFound(format!("Prompt {} not found", id)));
    }
    Ok(())
}

/// Get a single prompt with group name and tags.
pub fn get_prompt(conn: &Connection, id: i64) -> Result<PromptDto, AppError> {
    let prompt = conn.query_row(
        "SELECT p.id, p.title, p.content, p.description, p.group_id,
                g.name as group_name, p.is_favorite, p.usage_count,
                p.last_used_at, p.created_at, p.updated_at
         FROM prompts p
         LEFT JOIN groups g ON p.group_id = g.id
         WHERE p.id = ?1",
        rusqlite::params![id],
        |row| {
            Ok(PromptDto {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                description: row.get(3)?,
                group_id: row.get(4)?,
                group_name: row.get(5)?,
                tags: vec![],
                is_favorite: row.get::<_, i64>(6)? != 0,
                usage_count: row.get(7)?,
                last_used_at: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        },
    ).map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Prompt {} not found", id)),
        other => AppError::Database(other.to_string()),
    })?;

    let tags = get_prompt_tags(conn, id)?;
    Ok(PromptDto {
        tags,
        ..prompt
    })
}

/// List all prompts with group name and tags.
pub fn list_prompts(conn: &Connection) -> Result<Vec<PromptDto>, AppError> {
    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.title, p.content, p.description, p.group_id,
                    g.name as group_name, p.is_favorite, p.usage_count,
                    p.last_used_at, p.created_at, p.updated_at
             FROM prompts p
             LEFT JOIN groups g ON p.group_id = g.id
             ORDER BY p.updated_at DESC",
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

    let rows = stmt.query_map([], |row| {
        Ok(PromptDto {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            description: row.get(3)?,
            group_id: row.get(4)?,
            group_name: row.get(5)?,
            tags: vec![],
            is_favorite: row.get::<_, i64>(6)? != 0,
            usage_count: row.get(7)?,
            last_used_at: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }).map_err(|e| AppError::Database(e.to_string()))?;

    let mut prompts: Vec<PromptDto> = Vec::new();
    for row in rows {
        let mut prompt = row.map_err(|e| AppError::Database(e.to_string()))?;
        prompt.tags = get_prompt_tags(conn, prompt.id)?;
        prompts.push(prompt);
    }
    Ok(prompts)
}

/// Search prompts by keyword, scored and sorted.
pub fn search_prompts(conn: &Connection, input: SearchPromptInput) -> Result<Vec<PromptDto>, AppError> {
    let keyword = format!("%{}%", input.keyword);
    let limit = input.limit.unwrap_or(20);

    let mut sql = String::from(
        "SELECT DISTINCT p.id, p.title, p.content, p.description, p.group_id,
                g.name as group_name, p.is_favorite, p.usage_count,
                p.last_used_at, p.created_at, p.updated_at
         FROM prompts p
         LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
         LEFT JOIN tags t ON pt.tag_id = t.id
         LEFT JOIN groups g ON p.group_id = g.id
         WHERE (
             p.title LIKE ?1
             OR p.content LIKE ?1
             OR p.description LIKE ?1
             OR t.name LIKE ?1
             OR g.name LIKE ?1
         )",
    );

    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = vec![Box::new(keyword.clone())];

    if input.only_favorite.unwrap_or(false) {
        params.push(Box::new(1i64));
        sql.push_str(&format!(" AND p.is_favorite = ?{}", params.len()));
    }

    if let Some(group_id) = input.group_id {
        params.push(Box::new(group_id));
        sql.push_str(&format!(" AND p.group_id = ?{}", params.len()));
    }

    sql.push_str(&format!(" LIMIT ?{}", params.len() + 1));
    params.push(Box::new(limit * 5)); // Fetch more for scoring

    let mut stmt = conn.prepare(&sql).map_err(|e| AppError::Database(e.to_string()))?;

    let rows = stmt.query_map(
        rusqlite::params_from_iter(params.iter().map(|p| p.as_ref())),
        |row| {
            Ok(PromptDto {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                description: row.get(3)?,
                group_id: row.get(4)?,
                group_name: row.get(5)?,
                tags: vec![],
                is_favorite: row.get::<_, i64>(6)? != 0,
                usage_count: row.get(7)?,
                last_used_at: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        },
    ).map_err(|e| AppError::Database(e.to_string()))?;

    let kw = input.keyword.to_lowercase();
    let mut results: Vec<PromptDto> = Vec::new();

    for row in rows {
        let mut prompt = row.map_err(|e| AppError::Database(e.to_string()))?;
        prompt.tags = get_prompt_tags(conn, prompt.id)?;
        results.push(prompt);
    }

    // Sort by score descending
    results.sort_by(|a, b| {
        let sa = score_for(a, &kw);
        let sb = score_for(b, &kw);
        sb.cmp(&sa)
    });

    results.truncate(limit as usize);
    Ok(results)
}

fn score_for(p: &PromptDto, kw: &str) -> i64 {
    let mut s: i64 = 0;
    if p.title.to_lowercase().contains(kw) { s += 50; }
    if p.tags.iter().any(|t| t.to_lowercase().contains(kw)) { s += 30; }
    if p.description.as_ref().map(|d| d.to_lowercase().contains(kw)).unwrap_or(false) { s += 15; }
    if p.content.to_lowercase().contains(kw) { s += 10; }
    if p.is_favorite { s += 10; }
    s += (p.usage_count).min(20);
    if p.last_used_at.is_some() { s += 5; }
    s
}

/// Mark a prompt as used: increment usage_count, update last_used_at.
pub fn mark_prompt_used(conn: &Connection, id: i64) -> Result<(), AppError> {
    let now = now_iso();
    let affected = conn
        .execute(
            "UPDATE prompts SET usage_count = usage_count + 1, last_used_at = ?1, updated_at = ?1 WHERE id = ?2",
            rusqlite::params![now, id],
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

    if affected == 0 {
        return Err(AppError::NotFound(format!("Prompt {} not found", id)));
    }

    // Log usage
    conn.execute(
        "INSERT INTO usage_logs (prompt_id, action, created_at) VALUES (?1, 'copy', ?2)",
        rusqlite::params![id, now],
    )
    .map_err(|e| AppError::Database(e.to_string()))?;

    Ok(())
}

// ── Helpers ──

pub(crate) fn now_iso() -> String {
    // Simple ISO 8601 timestamp using chrono or manual
    #[allow(deprecated)]
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    let secs = now.as_secs();
    // Format: YYYY-MM-DD HH:MM:SS (simplified, we'll use this for now)
    // Better to use chrono, but avoiding extra dependency for MVP
    format_ts(secs)
}

fn format_ts(secs: u64) -> String {
    let days = secs / 86400;
    let time_secs = secs % 86400;
    let hours = time_secs / 3600;
    let mins = (time_secs % 3600) / 60;
    let secs = time_secs % 60;

    // Calculate year/month/day from days since epoch (1970-01-01)
    let (y, m, d) = days_to_date(days as i64);

    format!("{:04}-{:02}-{:02}T{:02}:{:02}:{:02}", y, m, d, hours, mins, secs)
}

fn days_to_date(mut days: i64) -> (i64, i64, i64) {
    days += 719468; // shift to 0000-03-01 epoch
    let era = if days >= 0 { days } else { days - 146096 } / 146097;
    let doe = days - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y, m, d)
}

/// Get tags for a prompt.
fn get_prompt_tags(conn: &Connection, prompt_id: i64) -> Result<Vec<String>, AppError> {
    let mut stmt = conn
        .prepare(
            "SELECT t.name FROM tags t
             INNER JOIN prompt_tags pt ON t.id = pt.tag_id
             WHERE pt.prompt_id = ?1
             ORDER BY t.name",
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

    let tags: Vec<String> = stmt
        .query_map(rusqlite::params![prompt_id], |row| row.get(0))
        .map_err(|e| AppError::Database(e.to_string()))?
        .filter_map(|r| r.ok())
        .collect();

    Ok(tags)
}

/// Sync tags for a prompt: remove old associations, create new tags, link.
fn sync_tags(conn: &Connection, prompt_id: i64, tags: &[String]) -> Result<(), AppError> {
    // Remove old associations
    conn.execute(
        "DELETE FROM prompt_tags WHERE prompt_id = ?1",
        rusqlite::params![prompt_id],
    )
    .map_err(|e| AppError::Database(e.to_string()))?;

    let now = now_iso();
    for tag_name in tags {
        let trimmed = tag_name.trim();
        if trimmed.is_empty() {
            continue;
        }
        // Insert tag if not exists
        conn.execute(
            "INSERT OR IGNORE INTO tags (name, created_at) VALUES (?1, ?2)",
            rusqlite::params![trimmed, now],
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

        // Get tag id
        let tag_id: i64 = conn
            .query_row(
                "SELECT id FROM tags WHERE name = ?1",
                rusqlite::params![trimmed],
                |row| row.get(0),
            )
            .map_err(|e| AppError::Database(e.to_string()))?;

        // Link
        conn.execute(
            "INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?1, ?2)",
            rusqlite::params![prompt_id, tag_id],
        )
        .map_err(|e| AppError::Database(e.to_string()))?;
    }

    Ok(())
}
