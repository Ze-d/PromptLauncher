use rusqlite::Connection;
use crate::errors::AppError;
use crate::models::*;
use crate::services::prompt_service::now_iso;

/// Create a new group.
pub fn create_group(conn: &Connection, input: CreateGroupInput) -> Result<Group, AppError> {
    let now = now_iso();
    let sort_order = input.sort_order.unwrap_or(0);

    conn.execute(
        "INSERT INTO groups (name, sort_order, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)",
        rusqlite::params![input.name.trim(), sort_order, now],
    )
    .map_err(|e| AppError::Database(e.to_string()))?;

    let id = conn.last_insert_rowid();
    get_group(conn, id)
}

/// List all groups ordered by sort_order, then name.
pub fn list_groups(conn: &Connection) -> Result<Vec<Group>, AppError> {
    let mut stmt = conn
        .prepare(
            "SELECT id, name, sort_order, created_at, updated_at FROM groups ORDER BY sort_order ASC, name ASC",
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

    let groups = stmt
        .query_map([], |row| {
            Ok(Group {
                id: row.get(0)?,
                name: row.get(1)?,
                sort_order: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| AppError::Database(e.to_string()))?
        .filter_map(|r| r.ok())
        .collect();

    Ok(groups)
}

/// Get a single group by id.
pub fn get_group(conn: &Connection, id: i64) -> Result<Group, AppError> {
    conn.query_row(
        "SELECT id, name, sort_order, created_at, updated_at FROM groups WHERE id = ?1",
        rusqlite::params![id],
        |row| {
            Ok(Group {
                id: row.get(0)?,
                name: row.get(1)?,
                sort_order: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        },
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Group {} not found", id)),
        other => AppError::Database(other.to_string()),
    })
}

/// Update an existing group.
pub fn update_group(conn: &Connection, input: UpdateGroupInput) -> Result<Group, AppError> {
    let now = now_iso();

    let mut sets: Vec<String> = vec!["updated_at = ?1".into()];
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = vec![Box::new(now)];

    if let Some(ref name) = input.name {
        sets.push(format!("name = ?{}", sets.len() + 1));
        params.push(Box::new(name.clone()));
    }
    if let Some(sort_order) = input.sort_order {
        sets.push(format!("sort_order = ?{}", sets.len() + 1));
        params.push(Box::new(sort_order));
    }

    let set_clause = sets.join(", ");
    let sql = format!(
        "UPDATE groups SET {} WHERE id = ?{}",
        set_clause,
        sets.len() + 1
    );
    params.push(Box::new(input.id));

    let affected = conn
        .execute(&sql, rusqlite::params_from_iter(params.iter().map(|p| p.as_ref())))
        .map_err(|e| AppError::Database(e.to_string()))?;

    if affected == 0 {
        return Err(AppError::NotFound(format!("Group {} not found", input.id)));
    }

    get_group(conn, input.id)
}

/// Delete a group by id. Prompts in this group will have group_id set to NULL.
pub fn delete_group(conn: &Connection, id: i64) -> Result<(), AppError> {
    // Unlink prompts from this group
    conn.execute(
        "UPDATE prompts SET group_id = NULL WHERE group_id = ?1",
        rusqlite::params![id],
    )
    .map_err(|e| AppError::Database(e.to_string()))?;

    // Delete the group
    let affected = conn
        .execute("DELETE FROM groups WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| AppError::Database(e.to_string()))?;

    if affected == 0 {
        return Err(AppError::NotFound(format!("Group {} not found", id)));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};

    static DB_COUNTER: AtomicU32 = AtomicU32::new(0);

    fn setup_db() -> Connection {
        let n = DB_COUNTER.fetch_add(1, Ordering::SeqCst);
        let tmp = std::env::temp_dir().join(format!("test_group_{}_{}.db", std::process::id(), n));
        let conn = Connection::open(&tmp).unwrap();
        crate::db::migrations::run_migrations(&conn).unwrap();
        conn
    }

    #[test]
    fn test_create_and_list_groups() {
        let conn = setup_db();
        let g = create_group(&conn, CreateGroupInput { name: "Dev".into(), sort_order: Some(1) }).unwrap();
        assert_eq!(g.name, "Dev");
        assert_eq!(g.sort_order, 1);

        let groups = list_groups(&conn).unwrap();
        assert_eq!(groups.len(), 1);
    }

    #[test]
    fn test_update_group() {
        let conn = setup_db();
        let g = create_group(&conn, CreateGroupInput { name: "Dev".into(), sort_order: None }).unwrap();
        let updated = update_group(&conn, UpdateGroupInput { id: g.id, name: Some("Prod".into()), sort_order: Some(2) }).unwrap();
        assert_eq!(updated.name, "Prod");
        assert_eq!(updated.sort_order, 2);
    }

    #[test]
    fn test_delete_group() {
        let conn = setup_db();
        let g = create_group(&conn, CreateGroupInput { name: "Dev".into(), sort_order: None }).unwrap();
        delete_group(&conn, g.id).unwrap();
        let groups = list_groups(&conn).unwrap();
        assert_eq!(groups.len(), 0);
    }

    #[test]
    fn test_delete_nonexistent_group() {
        let conn = setup_db();
        let result = delete_group(&conn, 999);
        assert!(result.is_err());
    }
}
