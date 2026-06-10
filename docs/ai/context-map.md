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
| `src/services/groupApi.ts` | Tauri invoke wrappers for group CRUD |
| `src/hooks/useGroupManager.ts` | Group CRUD state + actions hook (extracted from MainPage) |
| `src/stores/helpers.ts` | Shared Zustand utilities (asyncStateSlice + runAsync) |
| `src/stores/promptStore.ts` | Zustand store for prompt state |
| `src/stores/searchStore.ts` | Zustand store for search state |
| `src/stores/groupStore.ts` | Zustand store for group state |
| `src/stores/settingStore.ts` | Zustand store for settings state |
| `src/components/layout/Sidebar.tsx` | Group navigation sidebar with inline CRUD |
| `src/components/layout/FilterBar.tsx` | Prompt filter bar + settings entry |
| `src/components/settings/SettingsModal.tsx` | Settings Modal (theme + shortcut recording + data import/export) |
| `src/components/settings/ShortcutSetting.tsx` | Shortcut recording component (Record/Cancel/Save) |
| `src-tauri/src/commands/prompt_commands.rs` | Tauri command handlers |
| `src-tauri/src/commands/group_commands.rs` | Group Tauri command handlers |
| `src-tauri/src/services/prompt_service.rs` | Prompt business logic (CRUD + search + tests) |
| `src-tauri/src/services/group_service.rs` | Group business logic (CRUD + tests) |
| `src-tauri/src/services/setting_service.rs` | Settings business logic (KV + tests) |
| `src-tauri/src/db/migrations.rs` | Database schema |
| `src-tauri/src/errors/app_error.rs` | Unified error type |

## Test Files

| File | Purpose |
|------|---------|
| `src/stores/searchStore.test.ts` | 11 tests — search, keyboard nav, reset |
| `src/stores/promptStore.test.ts` | 8 tests — CRUD state transitions |
| `src/stores/settingStore.test.ts` | 5 tests — settings load/save/type coercion |
| `src-tauri/src/services/prompt_service.rs#tests` | 22 tests — CRUD, search, tags, mark_used |
| `src-tauri/src/services/group_service.rs#tests` | 4 tests — CRUD, not-found |
| `src-tauri/src/services/setting_service.rs#tests` | 6 tests — get/update/upsert/parse |

## Key Config Files

| File | Purpose |
|------|---------|
| `package.json` | Frontend deps + scripts (dev/build/test/lint/typecheck) |
| `vitest.config.ts` | Vitest test runner config |
| `src/test-setup.ts` | Test setup (jest-dom matchers) |
| `vite.config.ts` | Vite dev server config |
| `tailwind.config.js` | Tailwind (darkMode: "class") |
| `tsconfig.json` | TypeScript strict mode config |
| `.eslintrc.cjs` | ESLint config |
| `src-tauri/Cargo.toml` | Rust dependencies |
| `src-tauri/tauri.conf.json` | Tauri app config (windows, tray, bundle) |

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
| `docs/todos/improvement-analysis.md` | Detailed improvement analysis |
| `docs/architecture/overview.md` | Architecture overview |
| `docs/architecture/component-tree.md` | Component tree |
| `docs/testing/testing-strategy.md` | Testing strategy |
| `docs/testing/tdd-guide.md` | TDD guide |
| `docs/ai/coding-rules.md` | Coding rules |
| `docs/ai/review-checklist.md` | Review checklist |
