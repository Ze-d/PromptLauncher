use tauri::AppHandle;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use crate::errors::AppError;

const DEFAULT_MODIFIERS: Modifiers = Modifiers::CONTROL.union(Modifiers::ALT);
const DEFAULT_KEY: Code = Code::Space;
const DEFAULT_SHORTCUT_STR: &str = "Ctrl+Alt+Space";

/// Register the global shortcut that toggles the quick-search window.
/// Only responds to the Pressed state to avoid double-trigger.
pub fn register_default_shortcut(app: &AppHandle) -> Result<(), AppError> {
    let shortcut = Shortcut::new(Some(DEFAULT_MODIFIERS), DEFAULT_KEY);

    let app_handle = app.clone();
    app.global_shortcut()
        .on_shortcut(shortcut, move |_app, _sc, event| {
            if event.state == ShortcutState::Pressed {
                let _ = crate::services::window_service::toggle_quick_search(&app_handle);
            }
        })
        .map_err(|e| AppError::Shortcut(format!(
            "Failed to register '{}': {}",
            DEFAULT_SHORTCUT_STR, e
        )))?;

    Ok(())
}

/// Re-register shortcut (for settings changes).
pub fn register_shortcut(app: &AppHandle, shortcut_str: &str) -> Result<(), AppError> {
    // Parse shortcut string like "Ctrl+Alt+Space"
    let shortcut = shortcut_str
        .parse::<Shortcut>()
        .map_err(|e| AppError::Shortcut(format!("Invalid shortcut '{}': {}", shortcut_str, e)))?;

    // Unregister all existing shortcuts
    app.global_shortcut()
        .unregister_all()
        .map_err(|e| AppError::Shortcut(e.to_string()))?;

    let app_handle = app.clone();
    app.global_shortcut()
        .on_shortcut(shortcut, move |_app, _sc, event| {
            if event.state == ShortcutState::Pressed {
                let _ = crate::services::window_service::toggle_quick_search(&app_handle);
            }
        })
        .map_err(|e| AppError::Shortcut(format!(
            "Failed to register '{}': {}",
            shortcut_str, e
        )))?;

    Ok(())
}
