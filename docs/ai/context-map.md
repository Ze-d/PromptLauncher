# Context Map

## Key Source Files

| File | Purpose |
|------|---------|
| `src/types/prompt.ts` | Frontend type definitions for Prompt |
| `src/services/promptApi.ts` | Tauri invoke wrappers for prompt CRUD |
| `src/services/clipboardApi.ts` | Tauri invoke wrappers for clipboard |
| `src/services/windowApi.ts` | Tauri invoke wrappers for window control |
| `src/services/settingApi.ts` | Tauri invoke wrappers for settings |
| `src/services/importExportApi.ts` | Tauri invoke wrappers for import/export |
| `src/stores/promptStore.ts` | Zustand store for prompt state |
| `src/stores/searchStore.ts` | Zustand store for search state |
| `src-tauri/src/commands/prompt_commands.rs` | Tauri command handlers |
| `src-tauri/src/services/prompt_service.rs` | Prompt business logic |
| `src-tauri/src/services/search_service.rs` | Search scoring and ranking |
| `src-tauri/src/db/migrations.rs` | Database schema |
| `src-tauri/src/errors/app_error.rs` | Unified error type |

## Key Docs

| File | Purpose |
|------|---------|
| `CODEX.md` | Project reference manual |
| `CLAUDE.md` | Claude Code project instructions |
| `AGENTS.md` | AI agent instructions |
| `docs/01-product-requirements.md` | Product spec |
| `docs/02-technical-architecture.md` | Architecture decisions |
| `docs/03-execution-plan.md` | Development phases |
| `docs/user-manual.md` | User manual |
| `docs/development-guide.md` | Developer guide |
| `docs/changelog.md` | Version changelog |
| `docs/todos/README.md` | TODO list and roadmap |
| `docs/architecture/overview.md` | Architecture overview |
| `docs/architecture/component-tree.md` | Component tree |
| `docs/testing/testing-strategy.md` | Testing strategy |
| `docs/testing/tdd-guide.md` | TDD guide |
| `docs/ai/coding-rules.md` | Coding rules |
| `docs/ai/review-checklist.md` | Review checklist |
