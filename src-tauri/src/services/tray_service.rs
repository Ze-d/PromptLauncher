use tauri::{
    menu::{MenuItemBuilder, MenuBuilder},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};
use crate::errors::AppError;

const MENU_OPEN: &str = "open";
const MENU_QUICK_SEARCH: &str = "quick_search";
const MENU_EXIT: &str = "exit";

/// Create the system tray icon with context menu.
pub fn create_tray(app: &AppHandle) -> Result<(), AppError> {
    let open_item = MenuItemBuilder::with_id(MENU_OPEN, "Open Main Window")
        .build(app)
        .map_err(|e| AppError::Window(e.to_string()))?;

    let search_item = MenuItemBuilder::with_id(MENU_QUICK_SEARCH, "Quick Search")
        .build(app)
        .map_err(|e| AppError::Window(e.to_string()))?;

    let exit_item = MenuItemBuilder::with_id(MENU_EXIT, "Exit")
        .build(app)
        .map_err(|e| AppError::Window(e.to_string()))?;

    let menu = MenuBuilder::new(app)
        .item(&open_item)
        .item(&search_item)
        .separator()
        .item(&exit_item)
        .build()
        .map_err(|e| AppError::Window(e.to_string()))?;

    let app_handle = app.clone();
    TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Prompt Launcher")
        .on_menu_event(move |_app, event| {
            match event.id().as_ref() {
                MENU_OPEN => {
                    let _ = super::window_service::show_main(&app_handle);
                }
                MENU_QUICK_SEARCH => {
                    let _ = super::window_service::show_quick_search(&app_handle);
                }
                MENU_EXIT => {
                    app_handle.exit(0);
                }
                _ => {}
            }
        })
        .build(app)
        .map_err(|e| AppError::Window(e.to_string()))?;

    Ok(())
}

/// Set up close-to-tray behavior on the main window.
/// When the user clicks X, hide the window instead of closing.
pub fn set_close_to_tray(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let w = window.clone();
        window.on_window_event(move |event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = w.hide();
            }
        });
    }
}
