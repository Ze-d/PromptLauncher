# 窗口/面板自适应与拖拽调整大小

> 创建：2026-06-11 | 状态：✅ 已完成

## 需求

Prompt 管理主页面（MainPage.tsx）的三栏布局（Sidebar | PromptList | Editor）需要：
1. 各面板**等比适应**主窗口大小（全屏 / 缩放时三栏联动）
2. 面板之间支持**拖拽调整**比例
3. Sidebar 支持**一键折叠/展开**
4. 面板比例和折叠状态**持久化**到数据库
5. PromptEditor 的 content textarea **随窗口高度动态伸缩**

## 改动清单（7 files changed, 2 files added）

### 新建文件

| 文件 | 说明 |
|------|------|
| [src/components/layout/ResizeHandle.tsx](src/components/layout/ResizeHandle.tsx) | 4px 垂直拖拽分隔条，Pointer Events 实现，hover 蓝色高亮 |
| [src/hooks/useResizableColumns.ts](src/hooks/useResizableColumns.ts) | 列宽管理 hook — ResizeObserver 监听容器宽度，比例 ↔ 像素双向转换，300ms 防抖持久化到 settings 表 |

### 修改文件

| 文件 | 变更 |
|------|------|
| [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json) | main 窗口添加 `minWidth: 680, minHeight: 420` |
| [src-tauri/src/models/setting.rs](src-tauri/src/models/setting.rs) | `sidebar_width`/`list_width`(px) → `sidebar_ratio`/`list_ratio`(%) + `sidebar_collapsed` |
| [src-tauri/src/services/setting_service.rs](src-tauri/src/services/setting_service.rs) | 解析新增的 `sidebar_ratio`、`list_ratio`、`sidebar_collapsed` |
| [src/types/setting.ts](src/types/setting.ts) | AppSettings 类型同步：`sidebarRatio`、`listRatio`、`sidebarCollapsed` |
| [src/stores/settingStore.ts](src/stores/settingStore.ts) | 默认值：sidebarRatio=18, listRatio=27, sidebarCollapsed=false |
| [src/stores/settingStore.test.ts](src/stores/settingStore.test.ts) | 测试 fixture 补全新字段 |
| [src/pages/MainPage.tsx](src/pages/MainPage.tsx) | 硬编码 `w-48`/`w-72` → 动态 `style={{ width }}` + 插入两个 ResizeHandle + containerRef |
| [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx) | 接收 `sidebarWidth`/`collapsed`/`onToggleCollapse` props，折叠态（48px）显示图标，展开态显示文字 |
| [src/components/prompt/PromptEditor.tsx](src/components/prompt/PromptEditor.tsx) | textarea `rows={8}` → flex-1 弹性布局，窗口缩放时高度自动适应 |

## 架构设计

```
┌─────────────────────────────────────────────────────┐
│  MainPage (containerRef → ResizeObserver)           │
│  ┌──────────┬──┬───────────┬──┬──────────────────┐ │
│  │ Sidebar  │⇔│ List      │⇔│ Editor (flex-1)   │ │
│  │ ratio=18%│  │ ratio=27% │  │ auto = 100-18-27 │ │
│  │          │  │           │  │                  │ │
│  │ ◀ toggle│  │           │  │ textarea flex-1  │ │
│  │  48px   │  │           │  │ (动态高度)        │ │
│  └──────────┘  └───────────┘  └──────────────────┘ │
│                   ⇔ = ResizeHandle                 │
└─────────────────────────────────────────────────────┘
```

**数据流：**
1. `useResizableColumns` hook 从 settingStore 读取初始比例
2. ResizeObserver 监听容器 `contentRect.width`
3. 像素宽度 = `(containerWidth - 8px handles) × ratio / 100`
4. 拖拽时 delta px → delta ratio → 更新本地 state → 300ms 防抖写入 settings 表
5. Sidebar/List 使用绝对像素宽度（`style={{ width }}`），Editor 用 `flex-1` 占满剩余空间

**约束规则：**
- Sidebar 展开态 ≥ 140px，折叠态 = 48px
- List ≥ 180px
- Editor ≥ 容器宽度的 15%（由 List 的 maxListRatio 保证）
- 窗口最小尺寸：680×420（Tauri 配置）

## 验证结果

```
pnpm typecheck  → ✅
pnpm test       → ✅ 24/24
cargo check     → ✅
cargo test      → ✅ 32/32
```
