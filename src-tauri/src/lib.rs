// lib.rs — Tauri library entry, command registration

pub mod commands;
pub mod db;
pub mod errors;
pub mod models;
pub mod services;
pub mod utils;

use commands::{clipboard_commands, group_commands, import_export_commands, prompt_commands, setting_commands, window_commands};
use db::connection::init_db;
use services::{shortcut_service, tray_service};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("failed to resolve app data dir");
            let db_state = init_db(&app_data_dir).expect("failed to initialize database");
            app.manage(db_state);

            let handle = app.handle().clone();

            // Global shortcut
            if let Err(e) = shortcut_service::register_default_shortcut(&handle) {
                eprintln!("Warning: {}", e);
            }

            // System tray
            if let Err(e) = tray_service::create_tray(&handle) {
                eprintln!("Warning: tray creation failed: {}", e);
            }

            // Close-to-tray: hide main window instead of closing
            tray_service::set_close_to_tray(&handle);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Window commands
            window_commands::show_quick_search_window,
            window_commands::hide_quick_search_window,
            window_commands::toggle_quick_search_window,
            window_commands::show_main_window,
            window_commands::hide_main_window,
            // Prompt commands
            prompt_commands::create_prompt,
            prompt_commands::update_prompt,
            prompt_commands::delete_prompt,
            prompt_commands::get_prompt,
            prompt_commands::list_prompts,
            prompt_commands::search_prompts,
            prompt_commands::mark_prompt_used,
            // Clipboard commands
            clipboard_commands::copy_to_clipboard,
            clipboard_commands::copy_prompt_to_clipboard,
            // Settings commands
            setting_commands::get_settings,
            setting_commands::update_setting,
            // Group commands
            group_commands::create_group,
            group_commands::list_groups,
            group_commands::update_group,
            group_commands::delete_group,
            // Import/Export commands
            import_export_commands::export_prompts_to_json,
            import_export_commands::import_prompts_from_json,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
