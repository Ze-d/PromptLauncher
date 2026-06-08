use tauri::State;
use crate::db::DbState;
use crate::errors::AppError;
use crate::models::*;
use crate::services::prompt_service;

#[tauri::command]
pub async fn create_prompt(
    db: State<'_, DbState>,
    input: CreatePromptInput,
) -> Result<PromptDto, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    prompt_service::create_prompt(&conn, input)
}

#[tauri::command]
pub async fn update_prompt(
    db: State<'_, DbState>,
    input: UpdatePromptInput,
) -> Result<PromptDto, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    prompt_service::update_prompt(&conn, input)
}

#[tauri::command]
pub async fn delete_prompt(
    db: State<'_, DbState>,
    id: i64,
) -> Result<(), AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    prompt_service::delete_prompt(&conn, id)
}

#[tauri::command]
pub async fn get_prompt(
    db: State<'_, DbState>,
    id: i64,
) -> Result<PromptDto, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    prompt_service::get_prompt(&conn, id)
}

#[tauri::command]
pub async fn list_prompts(
    db: State<'_, DbState>,
) -> Result<Vec<PromptDto>, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    prompt_service::list_prompts(&conn)
}

#[tauri::command]
pub async fn search_prompts(
    db: State<'_, DbState>,
    input: SearchPromptInput,
) -> Result<Vec<PromptDto>, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    prompt_service::search_prompts(&conn, input)
}

#[tauri::command]
pub async fn mark_prompt_used(
    db: State<'_, DbState>,
    id: i64,
) -> Result<(), AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    prompt_service::mark_prompt_used(&conn, id)
}
