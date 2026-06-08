# Prompt Launcher 开发指南

## 1. 环境准备

### 必需工具

| 工具 | 用途 | 安装方式 |
|------|------|----------|
| Node.js (≥18) | 前端运行时 | `winget install OpenJS.NodeJS.LTS` 或 [nodejs.org](https://nodejs.org) |
| pnpm | 包管理器 | `npm install -g pnpm` |
| Rust | 后端编译 | `winget install Rustlang.Rustup` 或 [rustup.rs](https://rustup.rs) |
| Git | 版本管理 | `winget install Git.Git` |

### Windows Tauri 依赖

确保安装了 Microsoft Visual Studio C++ Build Tools 和 WebView2。参考 [Tauri 官方文档](https://v2.tauri.app/start/prerequisites/)。

### 验证环境

```bash
node -v        # ≥ 18
pnpm -v        # ≥ 8
rustc --version
cargo --version
git --version
```

---

## 2. 快速开始

```bash
# 克隆项目
git clone <repo-url> prompt-launcher
cd prompt-launcher

# 安装依赖
pnpm install

# 启动开发
pnpm dev
```

`pnpm dev` 会同时启动 Vite 开发服务器和 Tauri 桌面窗口。

---

## 3. 项目结构

```
prompt-launcher/
├── src/                    # React 前端
│   ├── app/                # App 入口和路由
│   ├── pages/              # 页面组件
│   │   ├── MainPage.tsx    # 主窗口（Prompt 管理）
│   │   ├── QuickSearchPage.tsx  # 快速搜索窗口
│   │   └── SettingsPage.tsx     # 设置页
│   ├── components/         # 可复用组件
│   │   ├── layout/         # AppLayout, Sidebar, Toolbar
│   │   ├── prompt/         # PromptList, PromptEditor, PromptCard, TagInput, GroupSelect
│   │   ├── search/         # QuickSearchBox, QuickSearchResultList, QuickSearchResultItem
│   │   ├── settings/       # ShortcutSetting, ThemeSetting, DataSetting
│   │   └── common/         # Button, Input, Textarea, Modal, Toast
│   ├── stores/             # Zustand 状态管理
│   │   ├── promptStore.ts  # Prompt CRUD 状态
│   │   ├── searchStore.ts  # 搜索状态
│   │   ├── settingStore.ts # 设置状态
│   │   └── uiStore.ts      # UI 状态
│   ├── services/           # Tauri invoke 封装层
│   │   ├── promptApi.ts
│   │   ├── settingApi.ts
│   │   ├── clipboardApi.ts
│   │   ├── windowApi.ts
│   │   └── importExportApi.ts
│   ├── types/              # TypeScript 类型定义
│   └── utils/              # 工具函数
│
├── src-tauri/              # Rust 后端
│   └── src/
│       ├── main.rs         # 入口
│       ├── lib.rs          # Tauri 插件注册
│       ├── commands/       # Tauri command 处理函数
│       ├── services/       # 业务逻辑层
│       ├── db/             # 数据库连接和迁移
│       ├── models/         # 数据模型
│       ├── errors/         # 统一错误类型
│       └── utils/          # 工具函数
│
└── docs/                   # 项目文档
```

---

## 4. 架构分层

```text
┌──────────────────────┐
│  React Components    │  UI 层：页面和组件
├──────────────────────┤
│  Zustand Stores      │  状态层：前端状态管理
├──────────────────────┤
│  src/services/*.ts   │  通信层：封装 Tauri invoke
├──────────────────────┤
│  Tauri Commands      │  接口层：参数校验和响应
├──────────────────────┤
│  Rust Services       │  业务层：核心逻辑
├──────────────────────┤
│  SQLite              │  数据层：本地持久化
└──────────────────────┘
```

### 核心约定

- **前端不直接调用 `invoke()`**：所有 Tauri 调用必须通过 `src/services/` 封装。
- **Command 不写业务逻辑**：Rust command 只做参数接收和响应返回，业务逻辑在 `services/` 中。
- **平台逻辑集中封装**：所有 Windows/macOS/Linux 差异代码放在 `platform_service.rs`。

---

## 5. 开发流程

### 日常开发

```bash
pnpm dev          # 启动开发环境（前端热更新 + Tauri 窗口）
```

### 修改前端

- 修改 `src/` 下的文件，Vite 会自动热更新。
- 新增 Tauri invoke 调用时，在 `src/services/` 中封装。

### 修改后端

- 修改 `src-tauri/` 下的 Rust 文件后，需要重新编译。Tauri 会自动重启应用。
- 也可以用 `cargo watch` 单独监听 Rust 变更。

### 数据库变更

1. 修改 `src-tauri/src/db/migrations.rs` 中的 migration。
2. 确保 migration 幂等（使用 `CREATE TABLE IF NOT EXISTS`）。
3. 同步更新 Rust models 和前端 types。

---

## 6. 测试

### 前端

```bash
pnpm lint        # ESLint 检查
pnpm typecheck   # TypeScript 类型检查
```

### Rust

```bash
cd src-tauri
cargo check      # 编译检查
cargo test       # 运行单元测试
```

### TDD 流程

1. **Red** — 先写失败的测试
2. **Green** — 写最小实现通过测试
3. **Refactor** — 在测试通过的前提下重构
4. **Commit**

参考 [docs/testing/tdd-guide.md](testing/tdd-guide.md)。

---

## 7. 打包

```bash
pnpm tauri build
```

产物在 `src-tauri/target/release/bundle/` 目录下。

### 打包前检查清单

参考 [docs/ai/review-checklist.md](ai/review-checklist.md)。

---

## 8. 技术栈参考

| 技术 | 文档 |
|------|------|
| Tauri v2 | https://v2.tauri.app |
| React | https://react.dev |
| TypeScript | https://www.typescriptlang.org |
| Vite | https://vitejs.dev |
| Tailwind CSS | https://tailwindcss.com |
| Zustand | https://docs.pmnd.rs/zustand |
| SQLite (rusqlite) | https://docs.rs/rusqlite |
