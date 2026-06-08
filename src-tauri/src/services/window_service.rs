use tauri::{AppHandle, Manager};
use crate::errors::AppError;

const QUICK_SEARCH_LABEL: &str = "quick-search";
const MAIN_LABEL: &str = "main";

/// Show the main window (create if not exists, else show + focus).
pub fn show_main(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(MAIN_LABEL) {
        window.show().map_err(|e| AppError::Window(e.to_string()))?;
        window.set_focus().map_err(|e| AppError::Window(e.to_string()))?;
    }
    Ok(())
}

/// Hide the main window (for close-to-tray behavior).
pub fn hide_main(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(MAIN_LABEL) {
        window.hide().map_err(|e| AppError::Window(e.to_string()))?;
    }
    Ok(())
}

/// Show the quick-search window.
pub fn show_quick_search(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(QUICK_SEARCH_LABEL) {
        if !window.is_visible().unwrap_or(false) {
            window.show().map_err(|e| AppError::Window(e.to_string()))?;
        }
        window.set_focus().map_err(|e| AppError::Window(e.to_string()))?;
        // Ensure it's on top
        window.set_always_on_top(true).map_err(|e| AppError::Window(e.to_string()))?;
    }
    Ok(())
}

/// Hide the quick-search window.
pub fn hide_quick_search(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(QUICK_SEARCH_LABEL) {
        window.hide().map_err(|e| AppError::Window(e.to_string()))?;
    }
    Ok(())
}

/// Toggle the quick-search window visibility.
pub fn toggle_quick_search(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(QUICK_SEARCH_LABEL) {
        if window.is_visible().unwrap_or(false) {
            hide_quick_search(app)?;
        } else {
            show_quick_search(app)?;
        }
    }
    Ok(())
}
