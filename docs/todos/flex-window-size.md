# 窗口/面板自适应与拖拽调整大小

> 创建：2026-06-11 | 状态：已确认，实现完成

**决策记录：**
- ✅ 方案 A：自实现 ResizeHandle，零依赖
- ✅ QuickSearch 窗口不做修改
- ✅ 面板比例存入 settings 表（`sidebar_ratio` / `list_ratio`，整数百分比）
- ✅ Sidebar 支持一键折叠/展开
- ✅ 所有面板使用比例而非绝对像素 → 窗口缩放时等比变化

## 问题描述

当前 Prompt 管理主页面（MainPage.tsx）使用硬编码固定宽度布局，存在以下问题：

| 问题 | 现状 | 影响 |
|------|------|------|
| 面板宽度固定 | Sidebar `w-48`(192px)、PromptList `w-72`(288px) | 窗口缩到很小时内容挤压/溢出，放大时浪费空间 |
| 无法拖拽调整 | 无任何 split-pane / drag-resize 逻辑 | 用户不能按需调整各栏宽度 |
| 无最小尺寸约束 | Tauri 窗口未设 `minWidth`/`minHeight` | 窗口可缩至极小导致 UI 崩溃 |
| QuickSearch 尺寸不可调 | 硬编码 720×420 + `resizable: false` | 用户无法调整搜索窗口大小 |

**涉及文件：**
- [src/pages/MainPage.tsx](src/pages/MainPage.tsx) — 三栏布局硬编码 `w-48` / `w-72` / `flex-1`
- [src/pages/QuickSearchPage.tsx](src/pages/QuickSearchPage.tsx) — 简单纵向布局，窗口 `resizable: false`
- [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json) — 窗口配置无 `minWidth`/`minHeight`
- [src/types/setting.ts](src/types/setting.ts) — 已定义 `quickWindowWidth`/`quickWindowHeight` 字段但未使用
- [src-tauri/src/models/setting.rs](src-tauri/src/models/setting.rs) — Rust 侧对应字段已定义但未用于窗口控制

---

## 任务拆解

### Task 1: 添加窗口最小尺寸约束

**目标：** 防止用户将窗口缩到过小导致 UI 布局崩溃。

**具体步骤：**

1. 在 `src-tauri/tauri.conf.json` 的 main 窗口配置中添加：
   ```json
   "minWidth": 680,
   "minHeight": 420
   ```
2. 测试：启动应用后尝试拖拽窗口边缘，验证不能缩到小于 680×420。

**工时：** 0.5h

---

### Task 2: MainPage 三栏改为弹性布局 + 拖拽调整

**目标：** Sidebar、PromptList、Editor 三栏宽度支持拖拽调整，且能随窗口缩放自适应。

**方案选择（二选一，建议方案 A）：**

#### 方案 A（推荐）：自实现轻量 ResizeHandle 组件

- 不引入第三方依赖
- 在各栏之间插入 4px 宽的拖拽手柄
- 拖拽时使用 `onPointerDown` → `onPointerMove` → `onPointerUp` 调整左右栏宽度
- 各栏宽度用百分比存储（初始：Sidebar 18%、List 27%、Editor 55%）
- 设置每栏最小宽度（Sidebar: 120px, List: 180px, Editor: 240px）

**具体步骤：**

1. 创建 `src/components/layout/ResizeHandle.tsx`：
   - 渲染一个 4px 宽的垂直拖拽条
   - hover 时高亮（蓝色）
   - 支持 `onPointerDown` 开始拖拽
   - 在 `document` 上监听 `pointermove` / `pointerup`
   - 通过回调传递 delta 给父组件

2. 创建 `src/hooks/useResizableColumns.ts`：
   - 管理三栏宽度百分比状态
   - 提供 `resizeLeft` / `resizeRight` 方法
   - 约束每栏不低于最小像素宽度
   - 将百分比持久化到 `localStorage`

3. 修改 `MainPage.tsx`：
   - 将 `w-48` / `w-72` 替换为百分比宽度
   - 在 Sidebar 与 List 之间、List 与 Editor 之间插入 `<ResizeHandle>`
   - 传入 `useResizableColumns` hook 的状态和方法

4. 验证：
   - 拖拽手柄，左右栏宽度联动变化
   - 窗口缩放时，各栏按比例缩放
   - 全屏模式下各栏按比例扩展
   - 栏宽度不小于最小值

**工时：** 3h

#### 方案 B：引入第三方库

- 使用 `allotment`（轻量、React 友好、支持持久化）或 `react-resizable-panels`
- 优点：功能完善，键盘可访问性好
- 缺点：增加依赖

| 库 | bundle size | 维护状态 | 特点 |
|----|------------|---------|------|
| [allotment](https://github.com/johnwalley/allotment) | ~15KB | 活跃 | 简单 API，内置持久化 |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | ~8KB | 活跃 | 性能优秀，像素级控制 |

**具体步骤（若选 allotment）：**

1. `pnpm add allotment`
2. 在 `MainPage.tsx` 中用 `<Allotment>` 替换外层 flex 容器
3. 设置各 pane 的 `minSize`、`preferredSize`
4. 利用 allotment 内置的 `onChange` + localStorage 持久化

**工时：** 1.5h

---

### Task 3: 面板宽度持久化

**目标：** 用户拖拽调整后的面板宽度在下次启动时保持。

**具体步骤：**

1. 用 `localStorage` 存储三栏宽度（key: `panel-sizes`）
2. 页面加载时读取，若无保存值则使用默认比例
3. 拖拽结束时写入 localStorage
4. 可选：后续可将宽度存入 settings 表（与其他设置统一管理）

**工时：** 并入 Task 2

---

### Task 4: QuickSearch 窗口尺寸支持调整

**目标：** 允许用户调整 QuickSearch 窗口大小，并持久化。

**具体步骤：**

1. 修改 `src-tauri/tauri.conf.json`：
   ```json
   {
     "label": "quick-search",
     "resizable": true,
     "minWidth": 480,
     "minHeight": 300
   }
   ```
2. 在 `window_service.rs` 的 `show_quick_search()` 中，从数据库读取 `quick_window_width` / `quick_window_height`，调用 `window.set_size()`。
3. 在 QuickSearch 窗口关闭时，读取当前窗口实际尺寸，写入 settings 表。
4. 在 `SettingsModal.tsx` 中已有"QuickSearch 窗口尺寸"入口（如果 UI 已预留），补充宽度/高度输入框；若没有则添加。

**工时：** 2h

---

### Task 5: 响应式布局边界情况处理

**目标：** 处理极端窗口尺寸下的 UI 表现。

**具体步骤：**

1. 窗口宽度 < 900px 时：PromptEditor 中的 textarea 字号适当缩小
2. 窗口高度 < 500px 时：PromptEditor 表单区域启用内部滚动
3. Sidebar 宽度 < 140px 时：隐藏分组名称文字，仅显示图标（或缩写）
4. PromptList 宽度 < 220px 时：卡片内容截断显示

**工时：** 1.5h

---

### Task 6: 测试与回归验证

**目标：** 确保新功能不影响现有功能。

**具体步骤：**

1. 手动测试矩阵：

| 场景 | 验证点 |
|------|--------|
| 默认窗口 (1100×700) | 三栏显示正常，默认比例合理 |
| 窗口拖拽缩小 | 各栏按比例缩小，不低于最小值 |
| 窗口拖拽放大 | 各栏按比例放大 |
| 全屏模式 (Win+Shift+Enter) | 各栏充分利用全屏宽度 |
| 拖拽 ResizeHandle 左移 | 左侧栏缩小、中间栏放大 |
| 拖拽 ResizeHandle 右移 | 中间栏缩小、右侧栏放大 |
| 拖拽到极限 | 被挤压的栏停在最小宽度，不再缩小 |
| 关闭重开 | 面板宽度与关闭前一致 |
| QuickSearch 窗口 | 可拖拽调整大小，重启后保持 |

2. 回归验证：
   - Sidebar 分组 CRUD 操作正常
   - PromptList 搜索、选择、收藏操作正常
   - PromptEditor 编辑、保存、复制操作正常
   - 设置弹窗正常打开和保存

**工时：** 1h

---

## 总工时估算

| Task | 内容 | 工时 |
|------|------|------|
| 1 | 窗口最小尺寸约束 | 0.5h |
| 2 | 三栏弹性布局 + 拖拽 | 3h（方案 A）/ 1.5h（方案 B） |
| 3 | 面板宽度持久化 | 并入 Task 2 |
| 4 | QuickSearch 窗口尺寸可调 | 2h |
| 5 | 响应式边界处理 | 1.5h |
| 6 | 测试与回归 | 1h |
| **总计** | | **8h（方案 A）/ 6.5h（方案 B）** |

---

## 待确认事项

1. **方案选择**：方案 A（自实现 ResizeHandle，零依赖）还是方案 B（引入 allotment/react-resizable-panels）？
2. **QuickSearch 窗口大小**：是否需要同时支持在设置页面手动输入宽高数值？
3. **面板宽度存储位置**：用 `localStorage`（前端独立）还是存入 settings 表（与后端统一）？
4. **Sidebar 折叠**：是否需要在拖拽之外增加一键折叠/展开 Sidebar 的功能？
