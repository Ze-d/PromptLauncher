use tauri::State;
use serde::{Deserialize, Serialize};
use crate::db::DbState;
use crate::errors::AppError;
use crate::models::*;
use crate::services::prompt_service;

#[derive(Debug, Serialize, Deserialize)]
struct ExportData {
    version: u32,
    exported_at: String,
    groups: Vec<Group>,
    tags: Vec<Tag>,
    prompts: Vec<ExportPrompt>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ExportPrompt {
    title: String,
    content: String,
    description: Option<String>,
    group_name: Option<String>,
    tags: Vec<String>,
    is_favorite: bool,
    usage_count: i64,
}

#[derive(Debug, Serialize)]
pub struct ImportResult {
    pub total: usize,
    pub imported: usize,
    pub skipped: usize,
    pub errors: Vec<String>,
}

/// Export all prompts, groups, and tags as JSON.
#[tauri::command]
pub async fn export_prompts_to_json(
    db: State<'_, DbState>,
) -> Result<String, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    let prompts = prompt_service::list_prompts(&conn)?;
    let now = prompt_service::now_iso();

    // Get all groups
    let mut group_stmt = conn
        .prepare("SELECT id, name, sort_order, created_at, updated_at FROM groups ORDER BY sort_order")
        .map_err(|e| AppError::Database(e.to_string()))?;
    let groups: Vec<Group> = group_stmt
        .query_map([], |row| {
            Ok(Group {
                id: row.get(0)?,
                name: row.get(1)?,
                sort_order: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| AppError::Database(e.to_string()))?
        .filter_map(|r| r.ok())
        .collect();

    // Get all tags
    let mut tag_stmt = conn
        .prepare("SELECT id, name, created_at FROM tags ORDER BY name")
        .map_err(|e| AppError::Database(e.to_string()))?;
    let tags: Vec<Tag> = tag_stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
            })
        })
        .map_err(|e| AppError::Database(e.to_string()))?
        .filter_map(|r| r.ok())
        .collect();

    let export_prompts: Vec<ExportPrompt> = prompts
        .into_iter()
        .map(|p| ExportPrompt {
            title: p.title,
            content: p.content,
            description: p.description,
            group_name: p.group_name,
            tags: p.tags,
            is_favorite: p.is_favorite,
            usage_count: p.usage_count,
        })
        .collect();

    let data = ExportData {
        version: 1,
        exported_at: now,
        groups,
        tags,
        prompts: export_prompts,
    };

    serde_json::to_string_pretty(&data).map_err(|e| AppError::ImportExport(e.to_string()))
}

/// Import prompts from a JSON string. Returns a summary report.
#[tauri::command]
pub async fn import_prompts_from_json(
    db: State<'_, DbState>,
    json: String,
) -> Result<ImportResult, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;

    // Parse JSON
    let data: ExportData = serde_json::from_str(&json)
        .map_err(|e| AppError::ImportExport(format!("Invalid JSON: {}", e)))?;

    if data.version != 1 {
        return Err(AppError::ImportExport("Unsupported export version".into()));
    }

    let mut imported = 0usize;
    let mut skipped = 0usize;
    let mut errors: Vec<String> = Vec::new();

    // Get existing prompt titles for dedup
    let mut existing_stmt = conn
        .prepare("SELECT title FROM prompts")
        .map_err(|e| AppError::Database(e.to_string()))?;
    let existing_titles: Vec<String> = existing_stmt
        .query_map([], |row| row.get(0))
        .map_err(|e| AppError::Database(e.to_string()))?
        .filter_map(|r| r.ok())
        .collect();

    for p in &data.prompts {
        if p.title.trim().is_empty() {
            skipped += 1;
            continue;
        }

        // Handle duplicate titles
        let mut title = p.title.clone();
        if existing_titles.contains(&title) {
            title = format!("{} (imported)", title);
        }

        // Resolve group
        let group_id = if let Some(ref name) = p.group_name {
            match conn.query_row(
                "SELECT id FROM groups WHERE name = ?1",
                rusqlite::params![name],
                |row| row.get(0),
            ) {
                Ok(id) => Some(id),
                Err(_) => {
                    // Create group
                    let now = prompt_service::now_iso();
                    conn.execute(
                        "INSERT INTO groups (name, sort_order, created_at, updated_at) VALUES (?1, 0, ?2, ?2)",
                        rusqlite::params![name, now],
                    )
                    .ok();
                    Some(conn.last_insert_rowid())
                }
            }
        } else {
            None
        };

        // Create prompt
        let input = CreatePromptInput {
            title: title.clone(),
            content: p.content.clone(),
            description: p.description.clone(),
            group_id,
            tags: Some(p.tags.clone()),
            is_favorite: Some(p.is_favorite),
        };

        match prompt_service::create_prompt(&conn, input) {
            Ok(_) => imported += 1,
            Err(e) => {
                skipped += 1;
                errors.push(format!("{}: {}", title, e));
            }
        }
    }

    Ok(ImportResult {
        total: data.prompts.len(),
        imported,
        skipped,
        errors,
    })
}
