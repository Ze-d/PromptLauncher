use tauri::AppHandle;
use crate::errors::AppError;
use crate::services::window_service;

#[tauri::command]
pub async fn show_quick_search_window(app: AppHandle) -> Result<(), AppError> {
    window_service::show_quick_search(&app)
}

#[tauri::command]
pub async fn hide_quick_search_window(app: AppHandle) -> Result<(), AppError> {
    window_service::hide_quick_search(&app)
}

#[tauri::command]
pub async fn toggle_quick_search_window(app: AppHandle) -> Result<(), AppError> {
    window_service::toggle_quick_search(&app)
}

#[tauri::command]
pub async fn show_main_window(app: AppHandle) -> Result<(), AppError> {
    window_service::show_main(&app)
}

#[tauri::command]
pub async fn hide_main_window(app: AppHandle) -> Result<(), AppError> {
    window_service::hide_main(&app)
}
