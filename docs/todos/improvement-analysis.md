# Prompt Launcher 改进分析报告

> 审查日期：2025-06-10 | 审查范围：全项目（前端 + Rust 后端 + 工程化）

---

## 一、总体评价

项目 MVP 完成度高，核心链路（保存 → 搜索 → 复制）运转正常。代码组织整体遵循了 CODEX.md 约定的分层原则（前端 services → Rust commands → Rust services）。TypeScript strict mode 全开，Rust 侧没有 unsafe 代码。

**原始短板（三项已全部解决 ✅）：**
1. ~~测试覆盖几乎为零~~ → ✅ 前端 24 tests + Rust 32 tests
2. ~~存在多个空壳文件~~ → ✅ 已删除 5 个空壳文件
3. ~~部分核心文件职责过重~~ → ✅ MainPage 313→79 行, Store 模式 DRY

---

## 二、分类改进详情

### A. 代码质量问题

#### A1. 空壳文件（P0）✅ 已解决 — 2025-06-10

已删除 5 个空壳文件 + 清理 `services/mod.rs` 注释行。`cargo check` + `pnpm typecheck` 通过。

#### A2. 搜索逻辑嵌入位置错误

`prompt_service.rs` 中 `search_prompts`（第 167-243 行）、`score_for`（第 245-270 行）、`parse_iso_to_secs`（第 272-283 行）、`date_to_days_epoch`（第 285-290 行）、`system_time_secs`（第 292-298 行）共约 130 行属于搜索服务职责，应迁入 `search_service.rs`。

**风险**：prompt_service 越来越大，后续增改搜索逻辑继续膨胀。

#### A3. 手动时间处理（风险较高）

`prompt_service.rs` 自行实现了约 80 行日期/时间函数：
- `now_iso()` — ISO 8601 格式化
- `format_ts()` — Unix 秒 → 字符串
- `days_to_date()` — 天数 → 年月日
- `date_to_days_epoch()` — 年月日 → 天数

这些实现未经充分测试，且时间处理 edge case 极多（闰年、时区、夏令时）。

**建议**：引入 `chrono = "0.4"` crate，5-10 行代码替代上述所有函数。已注明注释 `// Better to use chrono, but avoiding extra dependency for MVP` — MVP 已完成，现在可以引入。

#### A4. 时间解析静默失败

`parse_iso_to_secs()` (prompt_service.rs:272-283) 解析失败返回 `Err(())`，调用方 `score_for` (第 256-267 行) 中 `if let Ok(...)` 静默跳过，导致时间衰减分数永远为 0。

```rust
// 当前：解析失败 → 静默跳过，分数计算不正确
if let Some(ref last_used) = p.last_used_at {
    if let Ok(last_secs) = parse_iso_to_secs(last_used) {
        // 仅当解析成功才进入
    }
}
```

**风险**：如果时间格式不一致（数据库手动修改、导入数据），搜索排序将不准确。

### B. 测试覆盖 ✅ 已解决 — 2025-06-10

#### B1. 当前状态

- **前端测试：24 个** — vitest 2.x + 3 个 store 测试文件
- **Rust 测试：32 个** — prompt_service 22 + group_service 4 + setting_service 6
- **E2E 测试：无**（待后续）

#### B2. 测试完成情况

| 模块 | 优先级 | 理由 |
|------|--------|------|
| prompt_service (Rust) | P0 | 核心 CRUD + 搜索，最多逻辑 |
| search_store (前端) | P0 | 搜索状态管理最复杂 |
| setting_service (Rust) | P1 | KV 存储 + 类型转换 |
| import_export_commands (Rust) | P1 | 数据迁移关键路径 |
| promptStore (前端) | P1 | 核心状态管理 |
| shortcut_service (Rust) | P2 | 平台相关难以测试 |
| 组件 (前端) | P2 | 可通过 E2E 覆盖 |

### C. 架构问题

#### C1. MainPage.tsx 过大 ✅ 已解决 — 2025-06-10

已拆分为 `MainPage.tsx`（79行）、`Sidebar.tsx`、`FilterBar.tsx`、`useGroupManager.ts`。

#### C2. Store 模式重复 ✅ 已解决 — 2025-06-10

已创建 `stores/helpers.ts`（`asyncStateSlice` + `runAsync`），重构 groupStore/settingStore/promptStore，每个 store 减少 ~15 行样板代码。

#### C3. 数据库时间存储方案

当前所有时间字段用 `TEXT NOT NULL` 存储 ISO 8601 字符串（如 `"2025-06-09T10:30:00"`）。

**问题**：
- 范围查询需字符串比较（可工作但不自然）
- 时间计算需应用层解析
- SQLite 内置时间函数（`datetime()`, `strftime()`）无法直接用于排序

**建议**：改为 `INTEGER` 存储 Unix timestamp（毫秒），或至少用 SQLite 兼容格式 `YYYY-MM-DD HH:MM:SS`（不含 T）。

#### C4. 缺少日志系统

Rust 端仅使用 `eprintln!()`，无结构化日志、无级别过滤、无文件输出。调试依赖数据库直接查看。

**建议**：引入 `tracing` + `tracing-subscriber`，按级别输出。

### D. 功能增强

#### D1. P1 优先级

| 功能 | 说明 | 工时 |
|------|------|------|
| 主窗口搜索增强 | MainPage Filter 做前端匹配高亮 + 后端搜索 | 2h |
| QuickSearch 窗口尺寸 | 当前 720×420 硬编码，加入设置项 | 1h |
| 收藏快捷操作 | PromptCard 直接可收藏，不用进 Editor | 1h |
| 批量操作 | 多选 + 批量删除/改分组 | 4h |
| 使用统计面板 | usage_logs 表已有数据，做 Dashboard | 3h |
| 复制反馈增强 | 显示复制内容摘要 | 0.5h |

#### D2. P2 优先级

| 功能 | 说明 | 工时 |
|------|------|------|
| 变量模板 `{{NAME}}` | 解析 + UI 输入 + 替换 | 5h |
| Markdown 预览 | PromptEditor Tab 切换编辑/预览 | 3h |
| FTS5 全文搜索 | SQLite FTS5 替换 LIKE 模糊搜索 | 3h |
| prompt 版本历史 | 新增 revision 表 + UI 查看 | 5h |

### E. CI/CD

#### E1. 当前状态

- CI 有 frontend lint/typecheck + Rust check/test
- Release 有 build + 上传 artifacts + 创建 GitHub Release
- 缓存策略基本正确

#### E2. 改进点

| 项目 | 问题 | 建议 |
|------|------|------|
| CI 缓存路径 | `C:\temp\rust-target` 硬编码 | 使用 `${{ runner.temp }}` |
| Clippy | 未集成 | 添加 `cargo clippy -- -D warnings` |
| 格式检查 | 未集成 | 添加 `cargo fmt --check` + `prettier --check` |
| Pre-commit | 无 | 添加 `lint-staged` + `husky` |

---

## 三、优先行动建议

### 已完成（2025-06-10）
1. ✅ 清理 5 个空壳文件
2. ✅ 给 prompt_service 补测试（22 tests）
3. ✅ 给 setting_service 补测试（6 tests）
4. ✅ 安装 vitest + 写 stores 测试（24 tests）
5. ✅ MainPage 拆分
6. ✅ Store 模式 DRY

### 待完成（下一阶段）
- [ ] 引入 chrono 替代手动时间处理
- [ ] 搜索逻辑迁入 search_service.rs
- [ ] 主窗口搜索增强 + 收藏快捷操作
- [ ] 批量操作
- [ ] CI 增强（clippy + fmt + pre-commit）
- [ ] 日志系统集成

---

## 四、风险矩阵

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 手动时间计算 bug | 中 | 高（搜索排序错误） | 引入 chrono |
| 测试缺失导致回归 | 高 | 中 | 优先补核心路径测试 |
| MainPage.tsx 继续膨胀 | 高 | 中（维护困难） | 拆分为多个组件 |
| 无日志导致生产调试困难 | 中 | 低（本地应用） | 引入 tracing |
| WAL + Mutex 并发瓶颈 | 低 | 低（单用户应用） | 暂不处理 |
