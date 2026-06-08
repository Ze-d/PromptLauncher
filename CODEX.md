# CODEX.md

# Prompt Launcher 项目参考手册

## 1. 项目概述

Windows 优先的本地 Prompt Launcher 桌面工具。技术栈：Tauri v2 + React + TypeScript + Vite + Tailwind CSS + Zustand + SQLite + Rust。

核心链路：

```text
保存 prompt
→ 按全局快捷键唤起快速搜索窗口
→ 搜索 prompt
→ 回车复制 prompt 到剪贴板
→ 用户手动粘贴使用
```

MVP 已全部完成。详细的产品需求、架构设计、执行计划见 [docs/](docs/)。

---

## 2. 项目结构

```text
prompt-launcher/
  README.md
  CODEX.md
  CLAUDE.md
  AGENTS.md
  package.json
  pnpm-lock.yaml

  docs/
    index.md
    01-product-requirements.md
    02-technical-architecture.md
    03-execution-plan.md
    user-manual.md
    development-guide.md
    changelog.md
    architecture/
    testing/
    ai/

  src/
    app/            # App.tsx, routes.tsx
    pages/          # MainPage, QuickSearchPage, SettingsPage
    components/     # layout/, prompt/, search/, settings/, common/
    stores/         # promptStore, searchStore, settingStore, uiStore
    services/       # promptApi, settingApi, clipboardApi, windowApi
    types/          # prompt, setting, api
    utils/          # date, search, keyboard

  src-tauri/
    src/
      main.rs
      lib.rs
      commands/     # prompt, setting, window, clipboard, import_export
      services/     # prompt, search, setting, shortcut, window, clipboard, tray, platform
      db/           # connection, migrations
      models/       # prompt, group, tag, setting, usage_log
      errors/       # app_error
      utils/        # time, path
```

---

## 3. 开发命令

```bash
pnpm install                              # 安装依赖
pnpm dev                                  # 启动开发
pnpm lint && pnpm typecheck               # 前端检查
cd src-tauri && cargo check && cargo test # Rust 检查与测试
pnpm tauri build                          # 打包
```

---

## 4. 代码规范

### TypeScript
- 禁止隐式 any，所有 API 返回类型和组件 props 必须定义类型。
- 复杂状态放入 Zustand store。
- Tauri invoke 调用统一封装在 `src/services/` 中。

### React
- 页面组件放 `pages/`，复用组件放 `components/`。
- 不在 UI 组件中直接写复杂业务逻辑。
- 键盘事件逻辑抽成 hook，Toast 统一处理。

### Rust
- command 只做参数接收和响应返回，业务逻辑放 `services/`。
- 错误统一转换为 AppError，平台相关逻辑集中封装在 `platform_service.rs`。
- Database migration 必须幂等。

---

## 5. 禁止事项

1. 不要接入云服务、AI API、账号系统。
2. 不要实现自动粘贴（MVP 范围外）。
3. 不要引入 Electron 或非必要依赖。
4. 不要一次性重构整个项目。
5. 不要把 prompt 数据上传到网络。

---

## 6. 提交规范

```text
feat: add prompt crud
fix: handle shortcut registration failure
refactor: split prompt service
docs: add architecture document
test: add search service tests
chore: configure tauri build
```

---

## 7. 任务完成输出要求

1. 完成了什么
2. 修改了哪些文件
3. 如何运行
4. 如何测试
5. 是否有未完成项
6. 是否引入了新依赖
7. 是否影响数据库 schema
