# Architecture Overview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Tauri v2 |
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Backend | Rust |
| Database | SQLite |

## Key Design Decisions

- See [02-technical-architecture.md](../02-technical-architecture.md) for full architecture.
- Windows-first, cross-platform by design.
- Local-first: no cloud, no accounts, no AI API.
- Copy-to-clipboard only (no auto-paste) for MVP.
