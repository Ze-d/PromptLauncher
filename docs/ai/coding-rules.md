# Coding Rules

## Conventions

- Tauri invoke calls must be wrapped in `src/services/*.ts` — never call `invoke()` directly from components.
- Rust business logic lives in `services/`, not in `commands/`.
- Commands only handle parameter receive + response return.
- Platform-specific code must be encapsulated in `platform_service.rs`.
- Database migrations must be idempotent.
- Frontend types must stay in sync with Rust models.
- First version: Windows only, no macOS/Linux platform code yet.
