# Changelog

## v0.1.2 — 2025-06-10 Engineering Improvements (Test Coverage + Architecture)

### 新增

- **前端测试环境**：安装 vitest 2.x + @testing-library/react + jsdom，创建 `vitest.config.ts`，新增 `pnpm test` / `pnpm test:watch` 脚本。
- **前端 Stores 测试**：3 个测试文件 24 个测试（searchStore 11, promptStore 8, settingStore 5），覆盖搜索、CRUD、键盘导航、设置等核心路径。
- **Rust 单元测试**：prompt_service 新增 22 个测试（CRUD、tag sync、搜索评分排序、mark_used）、setting_service 新增 6 个测试（读写、Upsert、类型解析）。总计 32 个 Rust 测试。
- **Store 公共模块**：创建 `src/stores/helpers.ts`（`asyncStateSlice` + `runAsync`），消除 loading/error/clearError 样板代码。

### 重构

- **MainPage.tsx 拆分**（313 行 → 79 行）：
  - `src/hooks/useGroupManager.ts` — Group CRUD 状态 + 逻辑 hook
  - `src/components/layout/Sidebar.tsx` — Group 导航 + 行内编辑/删除
  - `src/components/layout/FilterBar.tsx` — 搜索过滤条 + 设置入口
  - `src/pages/MainPage.tsx` — 薄编排层
- **Store 模式 DRY**：groupStore、settingStore、promptStore 三个 store 使用公共 helper，各减少约 15 行重复代码。

### 删除

- 5 个空壳文件：`search_service.rs`、`platform_service.rs`、`uiStore.ts`、`ThemeSetting.tsx`、`DataSetting.tsx`
- `src-tauri/src/services/mod.rs` 中对应注释行

### 修改文件

| 新增 | 修改 | 删除 |
|------|------|------|
| `vitest.config.ts` | `package.json` (+scripts, +devDeps) | `src/stores/uiStore.ts` |
| `src/test-setup.ts` | `src/pages/MainPage.tsx` | `src/components/settings/ThemeSetting.tsx` |
| `src/hooks/useGroupManager.ts` | `src/stores/promptStore.ts` | `src/components/settings/DataSetting.tsx` |
| `src/components/layout/FilterBar.tsx` | `src/stores/settingStore.ts` | `src-tauri/src/services/search_service.rs` |
| `src/components/layout/Sidebar.tsx` | `src/stores/groupStore.ts` | `src-tauri/src/services/platform_service.rs` |
| `src/stores/helpers.ts` | `src-tauri/src/services/prompt_service.rs` (+22 tests) | `src-tauri/src/services/mod.rs` (-2 lines) |
| `src/stores/searchStore.test.ts` | `src-tauri/src/services/setting_service.rs` (+6 tests) | |
| `src/stores/promptStore.test.ts` | `docs/todos/README.md` | |
| `src/stores/settingStore.test.ts` | | |

### 验证

- `pnpm typecheck` — ✅ 零错误
- `pnpm test` — ✅ 24/24 passed
- `cargo test` — ✅ 32/32 passed
- `cargo check` — ✅ 通过

---

## v0.1.1 — 2025-06-10 Dark Mode + Tray Icon Fix

### 新增

- **深色模式完善**：添加 `darkMode: 'class'` Tailwind 配置，App.tsx 主题激活逻辑（System/Light/Dark），所有主窗口组件添加 `dark:` 变体样式，Settings Modal 新增主题选择器。
- **托盘图标修复**：`TrayIconBuilder` 添加 `.icon()` 调用，使用应用默认图标，修复 Windows 下托盘图标不显示的问题。

### 修改文件

- `tailwind.config.js` — 添加 `darkMode: "class"`
- `src/app/App.tsx` — 新增主题激活 hook（读取 store → 切换 `<html>` 的 `dark` class）
- `src/pages/MainPage.tsx` — 全组件 dark 样式
- `src/components/prompt/PromptCard.tsx` — dark 样式
- `src/components/prompt/PromptEditor.tsx` — dark 样式（重构为提取公共 class）
- `src/components/prompt/TagInput.tsx` — dark 样式
- `src/components/prompt/GroupSelect.tsx` — dark 样式
- `src/components/settings/SettingsModal.tsx` — dark 样式 + 新增主题选择器
- `src/components/settings/ShortcutSetting.tsx` — dark 样式
- `src-tauri/src/services/tray_service.rs` — 添加图标设置

---

## v0.1.0 — 2025-06-09 P1 Features

### 新增

- **Settings Modal**：主页面新增齿轮 ⚙ 按钮，点击弹出设置模态框，包含快捷键录制和数据导入导出两个区块。
- **快捷键录制按钮**：显式 Record/Cancel/Save 录制流程，防止误触发。录制后自动保存到后端并重注册全局快捷键。
- **JSON 导入导出完善**：导出已含 groups/tags/prompts 三个数组；导入时先独立处理 groups 和 tags 数组，再导入 prompts，结果报告包含分组数和标签数。
- **最近使用排序优化**：侧边栏新增 🕐 Recent 视图，筛选 30 天内有使用记录的 prompt；搜索评分引入时间衰减（1 天内 +15，7 天内 +10，30 天内 +5）。
- **收藏优先显示**：All Prompts 视图下收藏项自动置顶，组内按更新时间降序排列。

### 修改文件

- `src/pages/MainPage.tsx` — 齿轮按钮 + Modal 入口、Recent 侧边栏、收藏优先排序
- `src-tauri/src/services/prompt_service.rs` — 搜索评分时间衰减逻辑
- `src-tauri/src/commands/import_export_commands.rs` — 导入 groups/tags 预处理
- `src/services/importExportApi.ts` — ImportResult 类型扩展

### 新增文件

- `src/components/settings/SettingsModal.tsx`
- `src/components/settings/ShortcutSetting.tsx`

---

## v0.0.1 (MVP) — 2025-06-09 Bugfix

### 修复

- **序列化 bug**：所有 Rust 模型添加 `#[serde(rename_all = "camelCase")]`，统一前后端字段命名（`group_id` → `groupId`），修复编辑 prompt 时 group/favorite 数据丢失。
- **Group CRUD**：实现完整的 Group 增删改查功能，包括后端 service/command 和前端 API/store/UI。
- **SQL 参数编号 bug**：修复 `prompt_service::update_prompt` 和 `group_service::update_group` 中 `?` 与 `?NNN` 混用导致的参数映射错误。
- **MainPage sidebar**：从 mock 空数组改为真实 group 数据，支持创建、重命名、删除分组。

### 新增文件

- `src-tauri/src/services/group_service.rs`
- `src-tauri/src/commands/group_commands.rs`
- `src/services/groupApi.ts`
- `src/stores/groupStore.ts`

## v0.0.1 (MVP)

### 功能

- **Prompt 管理**：新增、编辑、删除、查看 prompt，支持标题、内容、描述、标签、分组、收藏。
- **快速搜索**：通过全局快捷键 `Ctrl + Alt + Space` 唤起搜索窗口，实时搜索本地 prompt。
- **剪贴板复制**：选中 prompt 后按回车，内容复制到系统剪贴板，自动更新使用次数和时间。
- **系统托盘**：关闭主窗口后隐藏到托盘，后台常驻以保证快捷键可用。
- **全局快捷键**：可自定义快捷键，冲突时提示。
- **设置页**：支持主题切换（亮色/暗色/跟随系统）、关闭到托盘、开机自启动。
- **导入导出**：支持 JSON 格式的数据备份和恢复。
- **Windows 安装包**：支持 `.msi` 和 `.exe` 安装。

### 技术栈

Tauri v2 + React + TypeScript + Vite + Tailwind CSS + Zustand + SQLite + Rust
