use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Window error: {0}")]
    Window(String),

    #[error("Clipboard error: {0}")]
    Clipboard(String),

    #[error("Shortcut error: {0}")]
    Shortcut(String),

    #[error("Import/Export error: {0}")]
    ImportExport(String),

    #[error("Unknown error: {0}")]
    Unknown(String),
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Unknown(e.to_string())
    }
}
