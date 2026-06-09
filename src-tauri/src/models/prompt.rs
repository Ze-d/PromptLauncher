use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Prompt {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub description: Option<String>,
    pub group_id: Option<i64>,
    pub is_favorite: bool,
    pub usage_count: i64,
    pub last_used_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// DTO returned to frontend — includes joined group name and tags.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptDto {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub description: Option<String>,
    pub group_id: Option<i64>,
    pub group_name: Option<String>,
    pub tags: Vec<String>,
    pub is_favorite: bool,
    pub usage_count: i64,
    pub last_used_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePromptInput {
    pub title: String,
    pub content: String,
    pub description: Option<String>,
    pub group_id: Option<i64>,
    pub tags: Option<Vec<String>>,
    pub is_favorite: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePromptInput {
    pub id: i64,
    pub title: Option<String>,
    pub content: Option<String>,
    pub description: Option<String>,
    pub group_id: Option<i64>,
    pub tags: Option<Vec<String>>,
    pub is_favorite: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchPromptInput {
    pub keyword: String,
    pub group_id: Option<i64>,
    pub only_favorite: Option<bool>,
    pub limit: Option<i64>,
}
