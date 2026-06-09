# TODOs

## P1 — v0.1.0

- [ ] 快捷键自定义（录制模式）
- [ ] JSON 导入导出完善（含 tags、groups）
- [ ] 最近使用排序优化
- [ ] 收藏优先显示
- [ ] 深色模式完善
- [x] ~~bug:不能编辑已有的prompt~~（已修复：序列化不匹配 + SQL参数编号）
- [x] ~~bug：不能添加group~~（已修复：实现 Group CRUD + 前端UI）

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
