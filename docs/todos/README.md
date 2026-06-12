# TODOs

> 最后更新：2026-06-11 | 全面审查结果

## P0 — 工程基础建设（有测试/质量风险）

- [x] **前端 vitest 测试环境搭建** — 2025-06-10：安装 vitest 2.x + @testing-library/react + jsdom，创建 `vitest.config.ts`，编写 3 个 store 测试文件（24 个测试），添加 `pnpm test` 脚本
- [x] **Rust 单元测试覆盖** — 2025-06-10：prompt_service 新增 22 个测试（CRUD、搜索、tag sync、mark_used）、setting_service 新增 6 个测试（settings 读写、类型解析）。总计 32 个 Rust 测试全部通过。
- [x] **空壳文件清理** — 2025-06-10：已删除 5 个空壳文件（search_service.rs, platform_service.rs, uiStore.ts, ThemeSetting.tsx, DataSetting.tsx），同时清理 services/mod.rs 注释行。`cargo check` + `pnpm typecheck` 通过。
- [ ] **搜索逻辑重构**：将 `prompt_service.rs` 中 `search_prompts` + `score_for` + 时间解析函数（约 130 行）迁入 `search_service.rs`，command 同时调用两个 service
- [ ] **时间处理引入 chrono crate**：当前 `prompt_service.rs` 手动实现了 `now_iso`、`format_ts`、`days_to_date`、`date_to_days_epoch`、`parse_iso_to_secs`（约 80 行）→ 引入 `chrono` 替代，减少 bug 风险

## P1 — 功能增强（用户体验提升）

- [x] 快捷键自定义（录制模式）— 完成
- [x] JSON 导入导出完善（含 tags、groups）— 完成
- [x] 最近使用排序优化 — 完成
- [x] 收藏优先显示 — 完成
- [x] 深色模式完善 — 完成
- [x] 托盘图标修复 — 完成
- [x] **窗口/面板自适应与拖拽调整** — 2026-06-11：三栏比例布局 + ResizeHandle 拖拽 + Sidebar 折叠 + Editor textarea 动态高度 + 比例持久化到 settings 表。详见 [flex-window-size.md](flex-window-size.md)
- [ ] **QuickSearch 窗口尺寸可配置**：当前固定 720×420，应在设置页或 window 配置中支持调节
- [ ] **组内 prompt 拖拽排序**：侧边栏 groups 和 prompts 列表支持拖拽重排序
- [ ] **批量操作**：PromptList 支持多选（Shift/Ctrl+Click），批量删除、批量修改 group、批量导出
- [ ] **主窗口内搜索增强**：当前 MainPage 的 Filter input 仅做简单前端 `find`，无后端搜索，无匹配高亮
- [ ] **收藏快捷操作**：PromptCard 上直接显示收藏/取消收藏按钮（当前需进入 Editor 才能操作）
- [ ] **复制反馈增强**：复制后显示 prompt 摘要而非仅 "Copied to clipboard!"
- [ ] **快捷键冲突可视化**：录制快捷键时显示 "此快捷键已被 XXX 占用"
- [ ] **使用统计面板**：Dashboard 页面展示 Top N 常用 prompt、使用频次趋势（usage_logs 表已有数据）
- [ ] **prompt 内容行号/字符数显示**：PromptEditor 底部显示内容统计

## P2 — 后续版本（重大功能）

- [ ] 自动粘贴（需平台 API，优先级按需）
- [ ] prompt 变量模板（如 `{{NAME}}`、`{{DATE}}`）— 高频需求
- [ ] Markdown 预览（PromptEditor 内 Tab 切换编辑/预览）
- [ ] prompt 版本历史（基于 usage_logs 扩展或新建 revision 表）
- [ ] 全文搜索引擎增强（SQLite FTS5）— 当前 LIKE 模糊搜索在大数据量下性能堪忧
- [ ] 快捷命令模式（输入 `/cmd` 直接执行特定操作）
- [ ] Obsidian / Markdown 文件夹同步
- [ ] 云同步 / 多设备同步
- [ ] 浏览器插件
- [ ] 团队 prompt 库

## P3 — 架构与代码质量（技术债务）

- [x] **MainPage.tsx 拆分** — 2025-06-10：拆为 `MainPage.tsx`（薄编排层, 79行）、`Sidebar.tsx`（Group 导航+CRUD）、`FilterBar.tsx`（搜索过滤条）、`useGroupManager.ts`（Group CRUD hook）。原 313 行 → 各组件 < 130 行。
- [x] **Store 模式 DRY** — 2025-06-10：创建 `stores/helpers.ts`（`asyncStateSlice` + `runAsync`），重构 groupStore/settingStore/promptStore 消除 loading/error 样板代码。每个 store 减少 ~15 行重复代码。
- [ ] **前端 CSS class 重复**：`inputClass`/`labelClass` 等在 PromptEditor 中定义一次，其余组件未复用，建议提取 shared styles 或使用 Tailwind `@apply` 组件层
- [ ] **Rust 动态 SQL 构建优化**：`prompt_service.rs::update_prompt` 和 `group_service.rs::update_group` 中动态 SET 子句构建逻辑几乎一致，应提取宏或通用函数
- [ ] **数据库时间存储优化**：当前 TEXT 存储 ISO 8601 字符串 → 改为 Unix timestamp (INTEGER) 或使用 SQLite datetime 函数，提升时间比较/排序性能
- [ ] **日志系统引入**：Rust 端替换 `eprintln!` 为 `log`/`tracing` crate，支持文件输出和级别过滤
- [ ] **错误处理细化**：前端多处空 `catch {}` 仅依赖 store 设置的 error，缺少恢复逻辑或重试提示
- [ ] **类型安全增强**：`settingStore.ts` 中 `saveSetting` 参数 `value: string | boolean | number` 直接 `.toString()` 所有类型，缺少类型校验
- [ ] **快捷键注册重构**：`shortcut_service.rs` 中 `register_shortcut` 应先 `unregister_all` 再注册，存在竞态窗口期（先解注册旧快捷键 → 新快捷键注册中间可能丢失快捷键）
- [ ] **WAL 模式下读并发受限**：`DbState` 使用 `Mutex<Connection>`，WAL 模式下允许多个 reader 但 Mutex 限制了并发。建议考虑 `r2d2-sqlite` 连接池（若后续有多读场景）
- [ ] **时间解析健壮性**：`parse_iso_to_secs` 解析失败返回 0（静默），导致搜索评分时间衰减计算错误 → 应返回 `Result` 或 `Option` 由调用方处理
- [ ] **`#[allow(deprecated)]` 清理**：`prompt_service.rs` 中 3 处 `#[allow(deprecated)]` 用于 `SystemTime::now()` → 确认替代方案后移除

## 工程改进（CI/CD + 工具链）

- [x] 前端 vitest 测试覆盖 — 24 tests ✅
- [x] Rust 单元测试覆盖 — 32 tests ✅
- [ ] E2E 测试（Playwright + Tauri driver 或手动回归脚本）
- [ ] CI 缓存优化（WIX/NSIS 下载缓存，减少重复下载 300MB+）
- [ ] Pre-commit hooks 配置（lint-staged + cargo fmt/clippy）
- [ ] `pnpm tauri build` 构建产物路径处理（当前 release CI 使用硬编码 `C:\temp\rust-target`，应使用环境变量或 `cargo metadata` 定位）
- [ ] Rust 端 `cargo clippy` 集成到 CI
- [ ] `cargo fmt` / `prettier` 统一代码格式
- [ ] macOS / Linux 平台适配

## Known Issues

- [ ] macOS / Linux 平台适配
- [ ] 快捷键冲突时的用户体验优化（当前仅 warning，无 UI 提示）
- [ ] 多个 monitor 场景下 quick-search 窗口弹出位置未优化（始终在默认屏幕中央）
- [x] `tauri.conf.json` 中 window 配置硬编码，不同分辨率体验不一致 — 2026-06-11：三栏比例布局自适应窗口大小，添加 minWidth/minHeight 约束

## 改造工时估算参考

| 类别 | 优先级 | 预估工时 | 说明 |
|------|--------|----------|------|
| 空壳文件清理 | P0 ✅ | 1h | 5 个文件 + mod.rs 清理 |
| 引入 chrono 替代手动时间 | P0 ⬜ | 1h | 需改 4 个函数 + 测试 |
| 前端测试环境搭建 | P0 ✅ | 2h | vitest + 3 个 store 测试 (24 tests) |
| Rust 测试补全 | P0 ✅ | 3h | prompt_service 22 + setting_service 6 |
| QuickSearch 增强 | P1 ⬜ | 2h | 窗口尺寸 + 匹配高亮 |
| 批量操作 | P1 ⬜ | 4h | 多选 + 批量删除/修改 |
| MainPage 拆分 | P3 ✅ | 3h | 组件拆分 + hook 提取 |
| 变量模板 | P2 ⬜ | 5h | 语法解析 + UI + 替换逻辑 |
| FTS5 全文搜索 | P2 ⬜ | 3h | 迁移 + 后端搜索 + 测试 |
| Store DRY 优化 | P3 ✅ | 2h | helpers.ts + 3 stores 重构 |
| 日志系统 | P3 ⬜ | 1h | tracing crate 集成 |
