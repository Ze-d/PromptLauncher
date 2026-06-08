# Prompt Launcher 技术架构文档

## 1. 技术选型

### 1.1 总体技术栈

```text
桌面框架：Tauri v2
前端框架：React
前端语言：TypeScript
构建工具：Vite
样式方案：Tailwind CSS
状态管理：Zustand
本地数据库：SQLite
系统能力：Rust + Tauri Commands + Tauri Plugins
目标平台：Windows 优先，预留 macOS / Linux
```

------

## 2. 选型理由

### 2.1 为什么选择 Tauri

Prompt Launcher 是一个小型桌面效率工具，核心需求是：

```text
全局快捷键
系统托盘
快速窗口
剪贴板
本地数据存储
低资源占用
跨平台潜力
```

Tauri 适合这种轻量工具。前端可以用 Web 技术快速开发，系统级能力由 Rust 和 Tauri 插件实现。

相比 Electron，Tauri 更适合作为这个项目的第一选择，原因是：

1. 更轻量。
2. 更适合小型工具。
3. 不需要打包完整 Chromium。
4. 可以调用系统能力。
5. 可以使用 React / Vue / Svelte 等任意前端框架。
6. 支持 Windows、macOS、Linux 等桌面平台。
7. 方便后续做跨平台适配。

### 2.2 为什么选择 React + TypeScript

React 适合快速构建列表、搜索框、编辑器、设置页等 UI。

TypeScript 用于保证数据结构稳定，降低前后端交互错误。

本项目中会有较多结构化数据：

```text
Prompt
Tag
Group
Settings
UsageLog
```

使用 TypeScript 可以减少字段变更导致的运行时错误。

### 2.3 为什么选择 SQLite

Prompt Launcher 是本地优先工具，数据规模中小，结构清晰。SQLite 适合本地桌面应用，因为它不需要单独数据库服务，并且支持事务和 SQL 查询。

SQLite 可以很好地支持：

1. prompt 持久化。
2. 标签查询。
3. 分组查询。
4. 最近使用排序。
5. 使用次数排序。
6. 后续全文搜索。
7. 导入导出。
8. 数据迁移。

### 2.4 为什么第一版不做自动粘贴

第一版只复制到剪贴板。

自动粘贴会引入额外复杂度：

1. 需要记录当前活动窗口。
2. 需要切回原窗口。
3. 需要模拟键盘输入。
4. 需要处理焦点问题。
5. 需要处理不同系统权限。
6. 容易被杀毒软件或安全策略拦截。

复制到剪贴板链路更稳定，更适合作为 MVP。

------

## 3. 总体架构

```text
┌────────────────────────────────────────────────────┐
│                    React Frontend                   │
│                                                    │
│  Main Window                  Quick Search Window   │
│  - Prompt 管理                - 搜索输入             │
│  - 设置页面                   - 结果列表             │
│  - 标签分组                   - 键盘选择             │
└───────────────────────┬────────────────────────────┘
                        │
                        │ Tauri invoke / event
                        ▼
┌────────────────────────────────────────────────────┐
│                 Tauri / Rust Backend                │
│                                                    │
│  Prompt Commands       Window Commands              │
│  Settings Commands     Clipboard Commands           │
│  Shortcut Service      Tray Service                 │
│  Database Service      Platform Service             │
└───────────────────────┬────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────┐
│                       SQLite                        │
│                                                    │
│  prompts                                            │
│  groups                                             │
│  tags                                               │
│  prompt_tags                                        │
│  settings                                           │
│  usage_logs                                         │
└────────────────────────────────────────────────────┘
```

------

## 4. 进程与窗口模型

### 4.1 窗口类型

本项目包含两个主要窗口：

1. 主窗口：用于完整管理 prompt。
2. 快速搜索窗口：用于快捷键唤起和快速复制。

### 4.2 主窗口

主窗口特征：

```text
可调整大小
正常任务栏显示
关闭时默认隐藏到托盘
用于 prompt CRUD 和设置
```

### 4.3 快速搜索窗口

快速搜索窗口特征：

```text
无边框
置顶
居中偏上
宽度约 720px
高度约 420px
默认隐藏
快捷键触发显示
Esc 关闭
回车复制后关闭
失焦可选关闭
```

### 4.4 托盘

托盘职责：

```text
显示应用运行状态
打开主窗口
打开快速搜索
新增 Prompt
打开设置
退出应用
```

------

## 5. 前端架构

### 5.1 前端目录结构

```text
src/
  app/
    App.tsx
    routes.tsx

  pages/
    MainPage.tsx
    QuickSearchPage.tsx
    SettingsPage.tsx

  components/
    layout/
      AppLayout.tsx
      Sidebar.tsx
      Toolbar.tsx

    prompt/
      PromptList.tsx
      PromptEditor.tsx
      PromptCard.tsx
      PromptDetail.tsx
      TagInput.tsx
      GroupSelect.tsx

    search/
      QuickSearchBox.tsx
      QuickSearchResultList.tsx
      QuickSearchResultItem.tsx

    settings/
      ShortcutSetting.tsx
      ThemeSetting.tsx
      DataSetting.tsx

    common/
      Button.tsx
      Input.tsx
      Textarea.tsx
      Modal.tsx
      Toast.tsx

  stores/
    promptStore.ts
    searchStore.ts
    settingStore.ts
    uiStore.ts

  services/
    promptApi.ts
    settingApi.ts
    clipboardApi.ts
    windowApi.ts

  types/
    prompt.ts
    setting.ts
    api.ts

  utils/
    date.ts
    search.ts
    keyboard.ts
```

------

## 6. 前端状态设计

### 6.1 Prompt 类型

```ts
export type Prompt = {
  id: number;
  title: string;
  content: string;
  description?: string | null;
  groupId?: number | null;
  groupName?: string | null;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
```

### 6.2 CreatePromptInput

```ts
export type CreatePromptInput = {
  title: string;
  content: string;
  description?: string | null;
  groupId?: number | null;
  tags?: string[];
  isFavorite?: boolean;
};
```

### 6.3 UpdatePromptInput

```ts
export type UpdatePromptInput = {
  id: number;
  title?: string;
  content?: string;
  description?: string | null;
  groupId?: number | null;
  tags?: string[];
  isFavorite?: boolean;
};
```

### 6.4 SearchPromptInput

```ts
export type SearchPromptInput = {
  keyword: string;
  groupId?: number | null;
  onlyFavorite?: boolean;
  limit?: number;
};
```

------

## 7. Rust 后端架构

### 7.1 Rust 目录结构

```text
src-tauri/
  Cargo.toml
  tauri.conf.json
  build.rs

  src/
    main.rs
    lib.rs

    commands/
      mod.rs
      prompt_commands.rs
      setting_commands.rs
      window_commands.rs
      clipboard_commands.rs
      import_export_commands.rs

    services/
      mod.rs
      prompt_service.rs
      search_service.rs
      setting_service.rs
      shortcut_service.rs
      window_service.rs
      clipboard_service.rs
      tray_service.rs
      platform_service.rs

    db/
      mod.rs
      connection.rs
      migrations.rs

    models/
      mod.rs
      prompt.rs
      group.rs
      tag.rs
      setting.rs
      usage_log.rs

    errors/
      mod.rs
      app_error.rs

    utils/
      mod.rs
      time.rs
      path.rs
```

------

## 8. 后端模块职责

### 8.1 PromptService

职责：

1. 新增 prompt。
2. 更新 prompt。
3. 删除 prompt。
4. 获取 prompt。
5. 搜索 prompt。
6. 标记 prompt 已使用。
7. 维护 prompt 与 tag 的关系。

主要方法：

```rust
create_prompt(input) -> Result<Prompt>
update_prompt(input) -> Result<Prompt>
delete_prompt(id) -> Result<()>
get_prompt(id) -> Result<Prompt>
list_prompts(filter) -> Result<Vec<Prompt>>
search_prompts(input) -> Result<Vec<Prompt>>
mark_prompt_used(id) -> Result<()>
```

### 8.2 SearchService

职责：

1. 对 prompt 搜索结果打分。
2. 对搜索结果排序。
3. 处理收藏、最近使用、使用次数等权重。
4. 后续可替换为 FTS5。

### 8.3 SettingsService

职责：

1. 获取设置。
2. 更新设置。
3. 管理快捷键配置。
4. 管理主题配置。
5. 管理开机自启动配置。
6. 管理默认动作配置。

### 8.4 ShortcutService

职责：

1. 注册全局快捷键。
2. 取消全局快捷键。
3. 快捷键变更后重新注册。
4. 快捷键触发后显示快速搜索窗口。
5. 处理快捷键冲突。

### 8.5 WindowService

职责：

1. 显示主窗口。
2. 隐藏主窗口。
3. 显示快速搜索窗口。
4. 隐藏快速搜索窗口。
5. 设置窗口位置。
6. 设置窗口置顶。
7. 处理关闭窗口时隐藏到托盘。

### 8.6 ClipboardService

职责：

1. 写入文本到剪贴板。
2. 返回复制结果。
3. 后续扩展为自动粘贴。

### 8.7 TrayService

职责：

1. 初始化托盘图标。
2. 注册托盘菜单。
3. 处理托盘菜单点击事件。
4. 退出应用。

### 8.8 PlatformService

职责：

封装平台差异。

```text
WindowsPlatformService
MacOSPlatformService
LinuxPlatformService
```

第一版只实现 Windows 逻辑，但接口设计不绑定 Windows。

------

## 9. Tauri Command 设计

### 9.1 Prompt Commands

```rust
#[tauri::command]
async fn create_prompt(input: CreatePromptInput) -> Result<PromptDto, AppError>;

#[tauri::command]
async fn update_prompt(input: UpdatePromptInput) -> Result<PromptDto, AppError>;

#[tauri::command]
async fn delete_prompt(id: i64) -> Result<(), AppError>;

#[tauri::command]
async fn get_prompt(id: i64) -> Result<PromptDto, AppError>;

#[tauri::command]
async fn list_prompts() -> Result<Vec<PromptDto>, AppError>;

#[tauri::command]
async fn search_prompts(input: SearchPromptInput) -> Result<Vec<PromptDto>, AppError>;

#[tauri::command]
async fn mark_prompt_used(id: i64) -> Result<(), AppError>;
```

### 9.2 Window Commands

```rust
#[tauri::command]
async fn show_main_window(app: AppHandle) -> Result<(), AppError>;

#[tauri::command]
async fn hide_main_window(app: AppHandle) -> Result<(), AppError>;

#[tauri::command]
async fn show_quick_search_window(app: AppHandle) -> Result<(), AppError>;

#[tauri::command]
async fn hide_quick_search_window(app: AppHandle) -> Result<(), AppError>;

#[tauri::command]
async fn toggle_quick_search_window(app: AppHandle) -> Result<(), AppError>;
```

### 9.3 Clipboard Commands

```rust
#[tauri::command]
async fn copy_to_clipboard(text: String) -> Result<(), AppError>;

#[tauri::command]
async fn copy_prompt_to_clipboard(id: i64) -> Result<(), AppError>;
```

### 9.4 Settings Commands

```rust
#[tauri::command]
async fn get_settings() -> Result<AppSettingsDto, AppError>;

#[tauri::command]
async fn update_setting(key: String, value: String) -> Result<(), AppError>;

#[tauri::command]
async fn update_shortcut(shortcut: String) -> Result<(), AppError>;
```

------

## 10. 数据库设计

### 10.1 prompts

```sql
CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    group_id INTEGER,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id)
);
```

### 10.2 groups

```sql
CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### 10.3 tags

```sql
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
);
```

### 10.4 prompt_tags

```sql
CREATE TABLE IF NOT EXISTS prompt_tags (
    prompt_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (prompt_id, tag_id),
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### 10.5 settings

```sql
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### 10.6 usage_logs

```sql
CREATE TABLE IF NOT EXISTS usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);
```

### 10.7 indexes

```sql
CREATE INDEX IF NOT EXISTS idx_prompts_title ON prompts(title);
CREATE INDEX IF NOT EXISTS idx_prompts_group_id ON prompts(group_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_favorite ON prompts(is_favorite);
CREATE INDEX IF NOT EXISTS idx_prompts_last_used_at ON prompts(last_used_at);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
```

------

## 11. 搜索实现方案

### 11.1 MVP 搜索 SQL

```sql
SELECT DISTINCT p.*
FROM prompts p
LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
LEFT JOIN tags t ON pt.tag_id = t.id
LEFT JOIN groups g ON p.group_id = g.id
WHERE
    p.title LIKE '%' || ? || '%'
    OR p.content LIKE '%' || ? || '%'
    OR p.description LIKE '%' || ? || '%'
    OR t.name LIKE '%' || ? || '%'
    OR g.name LIKE '%' || ? || '%'
LIMIT ?;
```

### 11.2 应用层排序

伪代码：

```text
score = 0

if title contains keyword:
    score += 50

if tag contains keyword:
    score += 30

if description contains keyword:
    score += 15

if content contains keyword:
    score += 10

if is_favorite:
    score += 10

score += recent_used_score
score += usage_count_score
```

排序规则：

```text
score DESC
last_used_at DESC
updated_at DESC
```

------

## 12. 配置设计

### 12.1 默认配置

```json
{
  "global_shortcut": "Ctrl+Alt+Space",
  "theme": "system",
  "default_action": "copy",
  "close_to_tray": true,
  "auto_start": false,
  "quick_window_width": 720,
  "quick_window_height": 420
}
```

### 12.2 主题值

```text
system
light
dark
```

### 12.3 默认动作

第一版只有：

```text
copy
```

后续支持：

```text
paste
copy_and_paste
```

------

## 13. 错误处理

### 13.1 错误类型

```text
DatabaseError
ValidationError
NotFoundError
ShortcutRegisterError
ClipboardError
WindowError
ImportExportError
UnknownError
```

### 13.2 前端错误展示

规则：

1. 用户操作错误：toast 提示。
2. 数据库错误：toast + 控制台日志。
3. 快捷键注册错误：弹窗提示用户修改。
4. 剪贴板错误：toast 提示复制失败。
5. 未知错误：显示通用错误提示。

------

## 14. 安全与隐私

### 14.1 本地优先

所有 prompt 默认只保存在本机 SQLite 数据库中。

### 14.2 不上传数据

第一版不接入任何网络 API，不上传 prompt，不做账号系统。

### 14.3 导入导出

导入导出由用户主动触发。

### 14.4 敏感内容提醒

prompt 可能包含 API key、隐私内容、公司内部信息。后续可以增加敏感信息提醒，但第一版只做本地保存。

------

## 15. 跨平台策略

### 15.1 第一版策略

```text
Windows 优先。
```

### 15.2 代码策略

所有平台相关逻辑放入：

```text
platform_service.rs
shortcut_service.rs
window_service.rs
tray_service.rs
```

业务层不要直接写 Windows 专属逻辑。

### 15.3 需要重点测试的平台能力

```text
全局快捷键
系统托盘
剪贴板
窗口置顶
窗口聚焦
开机启动
安装包
```

------

## 16. 测试策略

### 16.1 Rust 单元测试

测试对象：

1. PromptService。
2. SearchService。
3. SettingsService。
4. 数据库迁移。
5. 错误处理。

### 16.2 前端测试

测试对象：

1. PromptList。
2. PromptEditor。
3. QuickSearchPage。
4. 键盘导航。
5. 设置页表单。

### 16.3 集成测试

核心流程：

```text
新增 prompt
→ 搜索 prompt
→ 复制 prompt
→ 使用次数 +1
→ last_used_at 更新
```

### 16.4 手动验收测试

必须手动测试：

1. Windows 快捷键唤起。
2. 托盘常驻。
3. 剪贴板复制。
4. 关闭窗口不退出。
5. 打包后安装运行。

------

## 17. 打包发布

### 17.1 Windows 打包目标

目标产物：

```text
.msi
.exe installer
```

### 17.2 发布前检查

1. 应用名称正确。
2. 图标正确。
3. 版本号正确。
4. 安装路径正常。
5. 卸载正常。
6. 数据目录不被误删。
7. 快捷键可用。
8. 托盘可用。

------

## 18. 技术风险

### 18.1 快捷键冲突

风险：

```text
默认快捷键可能被其他软件占用。
```

方案：

```text
注册失败时提示用户修改快捷键。
```

### 18.2 快速窗口焦点问题

风险：

```text
窗口显示后输入框没有自动聚焦。
```

方案：

```text
Rust 侧显示窗口并置顶。
前端 mounted 后主动 focus 输入框。
必要时延迟 50ms 再 focus。
```

### 18.3 SQLite 数据迁移

风险：

```text
后续版本表结构变化导致老用户数据不可用。
```

方案：

```text
从第一版开始维护 migrations。
每次 schema 变更增加 migration 版本。
```

### 18.4 跨平台细节

风险：

```text
Windows 可用不代表 macOS / Linux 立即可用。
```

方案：

```text
平台相关逻辑统一封装。
每个平台单独验收。
```

------

## 19. 架构原则

1. 本地优先。
2. 简单优先。
3. 核心链路优先。
4. 键盘体验优先。
5. 系统能力封装。
6. 前后端类型清晰。
7. 不在业务逻辑中写死平台细节。
8. 不过早引入复杂依赖。
9. 不把 prompt 数据上传到网络。
10. 每个阶段都有可运行版本。

------

## 20. 第一版最终架构总结

```text
Tauri 负责桌面容器和系统能力。
React 负责 UI。
TypeScript 负责前端类型安全。
Rust 负责后端 command、窗口、快捷键、托盘、数据库访问。
SQLite 负责本地持久化。
```

第一版核心闭环：

```text
Prompt CRUD
→ SQLite 保存
→ 全局快捷键唤起
→ 快速搜索
→ 回车复制到剪贴板
→ 托盘后台常驻
```