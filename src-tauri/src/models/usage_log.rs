use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageLog {
    pub id: i64,
    pub prompt_id: i64,
    pub action: String,
    pub created_at: String,
}
