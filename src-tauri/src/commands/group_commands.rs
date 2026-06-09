use tauri::State;
use crate::db::DbState;
use crate::errors::AppError;
use crate::models::*;
use crate::services::group_service;

#[tauri::command]
pub async fn create_group(
    db: State<'_, DbState>,
    input: CreateGroupInput,
) -> Result<Group, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    group_service::create_group(&conn, input)
}

#[tauri::command]
pub async fn list_groups(
    db: State<'_, DbState>,
) -> Result<Vec<Group>, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    group_service::list_groups(&conn)
}

#[tauri::command]
pub async fn update_group(
    db: State<'_, DbState>,
    input: UpdateGroupInput,
) -> Result<Group, AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    group_service::update_group(&conn, input)
}

#[tauri::command]
pub async fn delete_group(
    db: State<'_, DbState>,
    id: i64,
) -> Result<(), AppError> {
    let conn = db.conn.lock().map_err(|e| AppError::Database(e.to_string()))?;
    group_service::delete_group(&conn, id)
}
