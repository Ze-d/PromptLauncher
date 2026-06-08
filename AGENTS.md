# AGENTS.md

## Project: Prompt Launcher

Windows-first local Prompt Launcher desktop app. Tauri v2 + React + TypeScript + SQLite + Rust. MVP complete.

## Before Starting Any Task

1. Read [CODEX.md](CODEX.md) — project reference manual with conventions, commands, and constraints.
2. Read [docs/ai/coding-rules.md](docs/ai/coding-rules.md) — coding conventions.
3. Check [docs/ai/context-map.md](docs/ai/context-map.md) for key file locations.

## Instructions

- Write tests first (TDD), verify they fail, then implement.
- Run `cargo test` (Rust) and `pnpm lint && pnpm typecheck` (frontend) before considering work complete.
- Follow existing code patterns — see [docs/ai/coding-rules.md](docs/ai/coding-rules.md).
- Keep changes minimal and focused.
- Tauri `invoke()` calls must go through `src/services/`, never called directly from components.
- Rust business logic in `services/`, commands only handle param routing.
- Platform-specific logic must be encapsulated in `platform_service.rs`.
- Database migrations must be idempotent.
- Sync frontend types with Rust models when changing data structures.

## Scope Boundaries

- **Maintenance & enhancements:** bug fixes, UI polish, performance, test coverage.
- **Do NOT:** Cloud sync, AI API, auto-paste, login/accounts, Electron, remote database.

## After Each Task

Report:
1. What was done
2. Files changed
3. How to run
4. How to test
5. Any unfinished items
6. New dependencies introduced
7. Database schema changes

Use [docs/ai/review-checklist.md](docs/ai/review-checklist.md) for self-review.
