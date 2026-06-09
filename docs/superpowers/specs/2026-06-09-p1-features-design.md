# P1 Features Design — 2026-06-09

## 概述

完成 v0.1.0 的 4 个 P1 功能：快捷键录制按钮、JSON 导入导出完善、最近使用排序优化、收藏优先显示。

全部改动约 5-6 个文件，无新增依赖，无数据库迁移。

---

## 1. Settings Modal（包含快捷键录制 + 导入导出）

### 设计方案

主页面右上角增加**齿轮设置按钮**，点击弹出 Modal 对话框，包含两个区块：

**a) Global Shortcut 区**

在快捷键输入框旁增加**显式录制按钮**，用户主动点击才进入录制模式。

```
默认状态:  [Ctrl+Alt+Space]  [Record]  [Save（禁用）]
录制状态:  [Press keys...]   [Cancel]  [Save（禁用）]
完成状态:  [Ctrl+Alt+X]      [Record]  [Save（启用）]
```

状态机：
- `idle` — 显示当前快捷键，Record 按钮可用
- `recording` — 输入框显示 "Press keys..."，蓝色闪烁边框，Cancel 按钮替换 Record
- 录制中按下修饰键（Ctrl/Alt/Shift/Meta）不结束录制
- 录制中按下普通键 → 捕获组合键 → 回到 `idle`，Save 按钮可用
- 按 Cancel → 回到 `idle`，恢复原快捷键
- 按 Save → 调用 `saveSetting("globalShortcut", combo)`，按钮恢复禁用

**b) Data 区**

导入/导出按钮 + 结果展示，与当前 `SettingsPage.tsx` 中 Data 区块一致。

**交互入口：** `MainPage.tsx` 工具栏右侧增加齿轮图标 ⚙ 按钮。

**涉及文件：**

| 文件 | 改动 |
|------|------|
| `src/components/settings/SettingsModal.tsx` | **新建** — Modal 组件，包含快捷键录制 + 数据导入导出 |
| `src/pages/MainPage.tsx` | 新增设置按钮 + Modal 开关状态 |
| `src/components/settings/ShortcutSetting.tsx` | **新建** — 快捷键录制独立组件（复用已有代码） |

**不涉及 Rust 改动**（`shortcut_service.rs` 和 `setting_commands.rs` 已完整）。

---

## 2. JSON 导入导出完善

### 当前状态

- **导出**：`export_prompts_to_json` 已包含 groups、tags、prompts（含 tags+group_name+is_favorite+usage_count）。
- **导入**：`import_prompts_from_json` 仅处理 prompts 数组，groups 和 tags 通过 prompt 间接创建。JSON 中的 `data.groups` 和 `data.tags` 数组未被直接使用。

### 设计方案

修改导入逻辑，按正确顺序处理三个数组：

**导入顺序：**

1. **Groups** — 遍历 `data.groups`，创建数据库中不存在的分组（按 name 去重）
2. **Tags** — 遍历 `data.tags`，创建数据库中不存在的标签
3. **Prompts** — 遍历 `data.prompts`，关联已有 groups/tags

**ImportResult 扩展：**

```rust
pub struct ImportResult {
    pub total: usize,
    pub imported: usize,
    pub skipped: usize,
    pub errors: Vec<String>,
    // 新增
    pub groups_imported: usize,
    pub tags_imported: usize,
}
```

**去重策略不变**：同标题 prompt 自动加 `(imported)` 后缀，不覆盖已有数据。

**涉及文件：**

| 文件 | 改动 |
|------|------|
| `src-tauri/src/commands/import_export_commands.rs` | 重构导入流程，增加 groups/tags 预处理 |
| `src/services/importExportApi.ts` | ImportResult 类型增加 `groupsImported`、`tagsImported` |
| `src/components/settings/SettingsModal.tsx` | Data 区块使用扩展后的导入结果 |

---

## 3. 最近使用排序优化

### 当前状态

- DB 有 `usage_count` 和 `last_used_at`，`mark_prompt_used()` 在复制时更新
- 主列表固定 `updated_at DESC` 排序
- 搜索评分中 `last_used_at` 仅给固定 +5 分（有则加，无则无）
- 侧边栏无 "Recent" 视图

### 设计方案

**3a. 侧边栏增加 "Recent" 视图**

`MainPage.tsx` 侧边栏在 "Favorites" 下方增加 "Recent" 入口：

```
All Prompts
★ Favorites
🕐 Recent        ← 新增
───────────────
自定义分组 A
自定义分组 B
```

- 筛选逻辑：`prompts.filter(p => p.lastUsedAt)`，按 `last_used_at DESC` 排序
- 限制显示最近 30 天内有使用记录的 prompt（超过 30 天不显示在 Recent 中）

**3b. 搜索评分时间衰减**

修改 `score_for()` 函数，将固定的 `last_used_at` 加分改为时间衰减：

```rust
// 当前：固定 +5
if p.last_used_at.is_some() { s += 5; }

// 新：按时间衰减
// 1 天内 +15, 7 天内 +10, 30 天内 +5, 超过 30 天 +0
```

**涉及文件：**

| 文件 | 改动 |
|------|------|
| `src/pages/MainPage.tsx` | 侧边栏增加 "Recent" 入口，`activeGroup === "recent"` 过滤逻辑 |
| `src-tauri/src/services/prompt_service.rs` | `score_for()` 增加时间衰减逻辑 |

---

## 4. 收藏优先显示

### 当前状态

- `is_favorite` 字段 + ★ 图标 + 侧边栏 "Favorites" 筛选均已实现
- "All" 视图下收藏项不置顶，仅按 `updated_at DESC` 排列
- 搜索评分给收藏 +10（保持不动）

### 设计方案

在 `MainPage.tsx` 的 `filteredPrompts` 中，当 `activeGroup === "all"` 时：

```
排序规则：
1. 收藏项 (isFavorite=true) 在前
2. 非收藏项 (isFavorite=false) 在后
3. 各自组内保持 updated_at DESC
```

等价于排序键：`(isFavorite DESC, updated_at DESC)`

不新增排序 UI，行为内建在 All 视图中。

**涉及文件：**

| 文件 | 改动 |
|------|------|
| `src/pages/MainPage.tsx` | `filteredPrompts` 排序逻辑增加收藏优先 |

---

## 改动清单汇总

| 文件 | 涉及功能 | 改动类型 |
|------|---------|---------|
| `src/components/settings/SettingsModal.tsx` | #1 快捷键录制, #2 导入导出 | **新建** Modal 组件 |
| `src/components/settings/ShortcutSetting.tsx` | #1 快捷键录制 | **新建** 录制独立组件 |
| `src/pages/MainPage.tsx` | #1 Modal 入口, #3 最近使用, #4 收藏优先 | 设置按钮 + 侧边栏 + 排序 |
| `src-tauri/src/commands/import_export_commands.rs` | #2 导入导出 | 重构导入流程 |
| `src-tauri/src/services/prompt_service.rs` | #3 最近使用 | score_for 时间衰减 |
| `src/services/importExportApi.ts` | #2 导入导出 | 类型扩展 |

**总计：6 个文件（2 新建 + 4 修改），无新增依赖，无数据库迁移**

---

## 验收标准

| # | 功能 | 验收标准 |
|---|------|---------|
| 1 | 快捷键录制 | 主页面点击齿轮 → Modal 弹出 → 点 Record → 按组合键 → 显示新快捷键 → 点 Save |
| 2 | 导入导出 | Modal 中点击导出含 groups/tags；导入后 groups/tags/prompts 正确恢复；结果含分组数+标签数 |
| 3 | 最近使用 | 侧边栏有 Recent 入口；仅显示 30 天内使用过的；搜索结果中最近使用的排更前 |
| 4 | 收藏优先 | All 视图中收藏项始终在非收藏项前面 |

---

## 非目标

- 不实现快捷键冲突检测（P2）
- 不实现导入预览/覆盖策略选择（保持当前安全策略）
- 不新增排序模式选择 UI
- 不引入新依赖
- 不修改数据库 schema
