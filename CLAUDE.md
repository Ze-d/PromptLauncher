# CLAUDE.md

## 项目概述

Prompt Launcher — Windows 优先的本地 Prompt 快速搜索与复制桌面工具。技术栈：Tauri v2 + React + TypeScript + Vite + Tailwind CSS + Zustand + SQLite + Rust。

**MVP 已完成。** 详细文档见 [docs/](docs/)，项目参考见 [CODEX.md](CODEX.md)。

## 工作流程

1. 阅读 [CODEX.md](CODEX.md) 了解项目规范和约束。
2. 阅读 [docs/ai/coding-rules.md](docs/ai/coding-rules.md) 确认编码约定。
3. 小步实现，每步保持项目可运行。
4. 完成后对照 [docs/ai/review-checklist.md](docs/ai/review-checklist.md) 自检。
5. 汇报：改了什么、动了哪些文件、如何运行、如何测试。

## 核心约定

- Tauri invoke 必须封装在 `src/services/*.ts`，组件不得直接调用 `invoke()`。
- Rust 业务逻辑放 `services/`，command 只做参数接收和响应返回。
- 平台相关逻辑集中在 `platform_service.rs`。
- 数据结构变更时同步更新前端类型、Rust 模型和数据库 migration。
- Database migration 必须幂等。

## 开发命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发
pnpm lint             # 前端 lint
pnpm typecheck        # 前端类型检查
cd src-tauri && cargo check && cargo test   # Rust 检查与测试
pnpm tauri build      # 打包
```

## 测试要求

- 核心逻辑写单元测试（Rust: `cargo test`，前端: vitest）。
- 修改 bug 先写回归测试。
- 涉及数据库操作需测试正常路径和边界情况。

## 禁止事项

- 不接入云服务、AI API、账号系统。
- 不实现自动粘贴（MVP 范围外）。
- 不引入 Electron 或非必要依赖。
- 不一次性重写整个项目。
- 不删除已有文档。
- 不把 prompt 数据上传到网络。

## 参考文件索引

| 文件 | 用途 |
|------|------|
| [CODEX.md](CODEX.md) | 项目参考手册（规范、命令、禁止事项） |
| [docs/01-product-requirements.md](docs/01-product-requirements.md) | 产品需求 |
| [docs/02-technical-architecture.md](docs/02-technical-architecture.md) | 技术架构 |
| [docs/03-execution-plan.md](docs/03-execution-plan.md) | 执行计划 |
| [docs/user-manual.md](docs/user-manual.md) | 使用手册 |
| [docs/development-guide.md](docs/development-guide.md) | 开发指南 |
| [docs/ai/coding-rules.md](docs/ai/coding-rules.md) | 编码规则 |
| [docs/ai/context-map.md](docs/ai/context-map.md) | 关键文件索引 |
| [docs/ai/review-checklist.md](docs/ai/review-checklist.md) | 审查清单 |
