# Testing Strategy

## Layers

| Layer | Tool | Scope |
|-------|------|-------|
| Rust Unit | `cargo test` | PromptService, SearchService, SettingService, DB migrations, AppError |
| Frontend Unit | Vitest + React Testing Library | Components: PromptList, PromptEditor, QuickSearchPage, keyboard nav, settings forms |
| Integration | `cargo test` (integration) | Full create → search → copy → update flow |
| Manual | Windows desktop | Global shortcut, tray, clipboard, window focus, installer |
