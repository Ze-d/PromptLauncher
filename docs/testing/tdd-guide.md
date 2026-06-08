# TDD Guide

## Cycle

1. **Red** — Write a failing test
2. **Green** — Write minimal code to pass
3. **Refactor** — Clean up while green
4. **Commit**

## Rules

- Never write implementation before the test.
- Run the test and watch it fail before implementing.
- For Rust: `cargo test` from `src-tauri/`.
- For frontend: `pnpm test` (configure Vitest).
- Core logic (services, search, scoring, error handling) must have tests.
- UI components test behavior, not pixels.
