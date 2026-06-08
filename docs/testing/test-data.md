# Test Data

Test fixtures live in `tests/fixtures/`. Do not import from production data sources in tests.

- Use in-memory SQLite database for Rust tests.
- Use mock Tauri invoke for frontend tests.
