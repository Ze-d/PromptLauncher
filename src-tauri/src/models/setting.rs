use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Setting {
    pub key: String,
    pub value: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettingsDto {
    pub global_shortcut: String,
    pub theme: String,
    pub default_action: String,
    pub close_to_tray: bool,
    pub auto_start: bool,
    pub quick_window_width: i64,
    pub quick_window_height: i64,
}

impl Default for AppSettingsDto {
    fn default() -> Self {
        Self {
            global_shortcut: "Ctrl+Alt+Space".into(),
            theme: "system".into(),
            default_action: "copy".into(),
            close_to_tray: true,
            auto_start: false,
            quick_window_width: 720,
            quick_window_height: 420,
        }
    }
}
