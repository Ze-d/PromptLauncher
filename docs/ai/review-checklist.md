# Review Checklist

- [ ] `cargo check` passes (from `src-tauri/`)
- [ ] `cargo test` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm dev` starts without errors
- [ ] Frontend types match Rust models
- [ ] No hardcoded secrets or API keys
- [ ] New Tauri invoke calls wrapped in services layer
- [ ] Platform-specific code encapsulated
- [ ] Database migration is idempotent
- [ ] No cloud/AI API dependencies introduced
- [ ] Follows existing code patterns
