# Prompt Launcher

轻量级本地优先的桌面 Prompt 快速启动器 / A lightweight, local-first desktop prompt launcher for Windows.

**核心闭环 / Core Flow：**
```
按快捷键 → 搜索 prompt → 回车复制到剪贴板 → 手动粘贴
Press global shortcut → Search → Enter → Copy → Paste
```

---

## 功能 / Features

- **Prompt CRUD** — 新增、编辑、删除、查看，支持标题/内容/描述/标签/分组/收藏
- **快速搜索** — `Ctrl+Alt+Space` 唤起搜索窗，实时过滤，键盘导航
- **剪贴板复制** — 回车复制内容到系统剪贴板，自动标记使用次数和时间
- **系统托盘** — 关闭主窗口隐藏到托盘，后台常驻
- **全局快捷键** — 默认 `Ctrl+Alt+Space`，可在设置页修改
- **设置页** — 快捷键录制、主题切换（system/light/dark）、关闭到托盘、开机自启
- **导入导出** — JSON 格式导出所有数据，支持导入并自动处理重名
- **本地存储** — SQLite 持久化，无需账号、无需网络、无需云

---

## 技术栈 / Tech Stack

| 层 Layer | 技术 Technology |
|----------|----------------|
| 桌面框架 Desktop | Tauri v2 |
| 前端 Frontend | React 18 + TypeScript 5 + Vite 5 |
| 样式 Styling | Tailwind CSS 3 |
| 状态管理 State | Zustand 4 |
| 后端 Backend | Rust |
| 数据库 Database | SQLite (rusqlite bundled) |
| 编译器 Compiler | MinGW-w64 (WinLibs GCC 16.1.0) + rust-lld |
| 打包 Bundle | NSIS installer |

---

## 快速开始 / Quick Start

### 环境要求 / Prerequisites

- Node.js 18+
- pnpm 10+
- Rust 1.95+ (stable-x86_64-pc-windows-msvc)
- MinGW-w64（编译必须，推荐 WinLibs via winget）
- Windows 10/11（WebView2 预装）

### 安装依赖 / Install

```bash
pnpm install
```

### 开发运行 / Dev

```powershell
# PowerShell — 先设置 MinGW PATH：
$env:PATH = "你的WinLibs路径\mingw64\bin;" + $env:PATH
pnpm tauri dev
```

### 前端检查 / Frontend Checks

```bash
pnpm typecheck   # TypeScript 类型检查
pnpm lint        # ESLint 检查
```

### Rust 检查 / Rust Checks

```bash
cd src-tauri
cargo check      # 快速检查（不链接）
cargo build      # 完整编译
cargo test       # 运行测试
```

### 打包 / Build

```bash
pnpm tauri build
# 产物 → src-tauri/target/release/bundle/nsis/Prompt Launcher_0.1.0_x64-setup.exe
```

---

## 项目结构 / Project Structure

```
PromptLauncher/
├── README.md
├── AGENTS.md                          # AI 助手指令
├── CODEX.md                           # Codex 执行手册
├── CLAUDE.md                          # Claude Code 配置
├── package.json                       # 前端依赖
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── index.html
│
├── docs/                              # 文档
│   ├── 01-product-requirements.md     # 产品需求
│   ├── 02-technical-architecture.md   # 技术架构
│   ├── 03-execution-plan.md           # 执行方案
│   ├── architecture/                  # 架构细节
│   ├── testing/                       # 测试策略
│   └── ai/                            # AI 编码规范
│
├── src/                               # React 前端
│   ├── app/App.tsx                    # 根组件 — 按窗口 label 路由
│   ├── pages/
│   │   ├── MainPage.tsx               # 三栏布局管理页
│   │   ├── QuickSearchPage.tsx        # 快速搜索窗口
│   │   └── SettingsPage.tsx           # 设置页
│   ├── components/
│   │   ├── layout/                    # AppLayout, Sidebar, Toolbar
│   │   ├── prompt/                    # PromptList, PromptEditor, PromptCard, TagInput, GroupSelect
│   │   ├── search/                    # QuickSearchBox, QuickSearchResultList, QuickSearchResultItem
│   │   ├── settings/                  # ShortcutSetting, ThemeSetting, DataSetting
│   │   └── common/                    # Button, Input, Modal, Toast
│   ├── stores/                        # Zustand: promptStore, searchStore, settingStore, uiStore
│   ├── services/                      # Tauri invoke 封装
│   ├── types/                         # TypeScript 类型定义
│   └── utils/                         # 工具函数
│
├── src-tauri/                         # Rust 后端
│   ├── Cargo.toml
│   ├── tauri.conf.json                # 窗口+打包配置
│   └── src/
│       ├── main.rs                    # 入口
│       ├── lib.rs                     # 模块注册 + builder + setup
│       ├── commands/                  # 19 个 Tauri commands
│       │   ├── prompt_commands.rs     # CRUD + search + mark_used
│       │   ├── window_commands.rs     # 窗口显隐控制
│       │   ├── clipboard_commands.rs  # 剪贴板读写
│       │   ├── setting_commands.rs    # 配置读写
│       │   └── import_export_commands.rs  # JSON 导入导出
│       ├── services/                  # 业务逻辑
│       ├── db/                        # connection + migrations
│       ├── models/                    # 数据模型 (6 个)
│       ├── errors/                    # 统一错误类型
│       └── utils/
│
├── tests/                             # 测试目录
└── scripts/                           # 脚本目录
```

---

## 数据库 / Database

| 表 Table | 说明 |
|----------|------|
| `prompts` | prompt 主表 — title/content/description/group_id/is_favorite/usage_count |
| `groups` | 分组表 |
| `tags` | 标签表 |
| `prompt_tags` | 多对多关联表 |
| `settings` | 键值配置表 |
| `usage_logs` | 使用日志表 |

---

## Tauri Commands（19 个）

| 分类 | Command | 说明 |
|------|---------|------|
| Window | `show_main_window` `hide_main_window` | 主窗口显隐 |
| | `show_quick_search_window` `hide_quick_search_window` `toggle_quick_search_window` | 搜索窗控制 |
| Prompt | `create_prompt` `update_prompt` `delete_prompt` | CRUD |
| | `get_prompt` `list_prompts` `search_prompts` `mark_prompt_used` | 查询+统计 |
| Clipboard | `copy_to_clipboard` `copy_prompt_to_clipboard` | 复制 |
| Settings | `get_settings` `update_setting` | 配置 |
| I/O | `export_prompts_to_json` `import_prompts_from_json` | 导入导出 |

---

## 里程碑 / Milestones

| M# | 名称 | 状态 |
|----|------|------|
| M0 | 项目初始化 / Project Init | ✅ |
| M1 | 窗口模型 / Window Model | ✅ |
| M2 | SQLite 数据层 / Database Layer | ✅ |
| M3 | Prompt CRUD | ✅ |
| M4 | 快速搜索 / Quick Search | ✅ |
| M5 | 剪贴板复制 / Clipboard Copy | ✅ |
| M6 | 全局快捷键 / Global Shortcut | ✅ |
| M7 | 系统托盘 / System Tray | ✅ |
| M8 | 设置页 / Settings Page | ✅ |
| M9 | 导入导出 / Import & Export | ✅ |
| M10 | Windows 打包 / Packaging | ✅ |

---

## 非目标 / Non-Goals (v0.1.0)

- ❌ AI 聊天客户端 / AI chat client
- ❌ 云同步 / Cloud sync
- ❌ 账号系统 / Account system
- ❌ 自动粘贴 / Auto-paste
- ❌ 浏览器插件 / Browser plugin
- ❌ 移动端 / Mobile version

---

## 许可 / License

MIT
