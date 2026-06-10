# TODOs

## P1 — v0.1.0

- [x] 快捷键自定义（录制模式）— 2025-06-09：主页面齿轮按钮 → Settings Modal，Record/Cancel/Save 录制流程
- [x] JSON 导入导出完善（含 tags、groups）— 2025-06-09：导入时独立处理 groups/tags 数组，结果展示分组数和标签数
- [x] 最近使用排序优化 — 2025-06-09：侧边栏新增 Recent 视图（30天内），搜索评分时间衰减（1天+15→7天+10→30天+5）
- [x] 收藏优先显示 — 2025-06-09：All 视图下收藏项自动置顶，组内按 updated_at DESC
- [x] 深色模式完善 — 2025-06-10：`tailwind.config.js` 添加 `darkMode: 'class'`，App.tsx 主题激活（System/Light/Dark），所有组件添加 `dark:` 变体，Settings Modal 新增主题选择器
- [x] ~~bug:不能编辑已有的prompt~~（已修复：序列化不匹配 + SQL参数编号）
- [x] ~~bug：不能添加group~~（已修复：实现 Group CRUD + 前端UI）
- [x] 隐藏的图标不显示 — 2025-06-10：TrayIconBuilder 添加 `.icon()` 调用，使用应用默认图标

## P2 — 后续版本

- [ ] 自动粘贴
- [ ] prompt 变量模板（如 `{{NAME}}`）
- [ ] Markdown 预览
- [ ] prompt 版本历史
- [ ] 云同步
- [ ] 多设备同步
- [ ] 浏览器插件
- [ ] Obsidian / Markdown 文件夹同步
- [ ] 全文搜索引擎增强（FTS5）
- [ ] 快捷命令模式
- [ ] 团队 prompt 库

## Known Issues

- [ ] macOS / Linux 平台适配
- [ ] 快捷键冲突时的用户体验优化

## 工程改进（2025-06-09 修复）

- [x] Rust 前后端字段序列化统一（`#[serde(rename_all = "camelCase")]`）
- [x] Group CRUD 后端实现（group_service.rs + group_commands.rs）
- [x] Group 前端集成（groupApi.ts + groupStore.ts + MainPage UI）
- [x] 修复 `update_prompt` / `update_group` SQL 参数编号 bug

## 工程改进

- [ ] Rust 单元测试覆盖
- [ ] 前端 vitest 测试覆盖
- [ ] E2E 测试
- [ ] CI 缓存优化（WIX/NSIS 下载缓存）
