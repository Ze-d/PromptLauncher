# Changelog

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
