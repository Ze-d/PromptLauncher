# Prompt Launcher 执行方案

## 1. 总体执行思路

本项目按垂直切片开发，不按“大模块一次性全部完成”的方式开发。

正确顺序是：

```text
先让项目跑起来
→ 再让窗口跑起来
→ 再让数据能保存
→ 再让 prompt 能管理
→ 再让搜索能工作
→ 再接快捷键
→ 再接剪贴板
→ 再接托盘
→ 最后打包
```

每个阶段都必须保持应用可运行。

------

## 2. 推荐开发节奏

每个 milestone 一个分支。

每个分支完成后做一次手动验收。

推荐节奏：

```text
Day 1：项目初始化 + 窗口模型
Day 2：SQLite + Prompt CRUD
Day 3：快速搜索 + 剪贴板复制
Day 4：全局快捷键 + 托盘
Day 5：设置页 + 导入导出
Day 6：打包 + 文档 + 修 bug
```

这个时间表是理想情况。实际开发时优先保证质量，不强行压缩。

------

## 3. 详细阶段计划

### Phase 0：准备环境

#### 任务

1. 安装 Node.js。
2. 安装 pnpm。
3. 安装 Rust。
4. 安装 Windows Tauri 依赖。
5. 确认 WebView2 可用。
6. 确认 Git 可用。

#### 验收

```bash
node -v
pnpm -v
rustc --version
cargo --version
git --version
```

------

### Phase 1：工程初始化

#### 目标

获得一个可运行的 Tauri + React 项目。

#### 任务

1. 初始化项目。
2. 配置 TypeScript。
3. 配置 Tailwind。
4. 创建基础页面。
5. 创建目录结构。
6. 写入文档。

#### 验收

```bash
pnpm dev
```

应用窗口能正常打开。

------

### Phase 2：窗口与路由

#### 目标

主窗口和快速搜索窗口分离。

#### 任务

1. 配置 main window。
2. 配置 quick-search window。
3. quick-search 默认隐藏。
4. 实现 window commands。
5. 前端区分不同窗口页面。
6. quick-search 支持 Esc 关闭。

#### 验收

```text
主窗口正常显示。
quick-search 可被 command 打开。
quick-search 输入框自动聚焦。
```

------

### Phase 3：数据库基础

#### 目标

建立 SQLite 本地持久化能力。

#### 任务

1. 初始化数据库。
2. 创建 schema。
3. 创建 migration。
4. 创建 Rust models。
5. 创建错误处理。
6. 写基础测试。

#### 验收

```text
应用启动后自动生成数据库文件。
表结构正确。
重复启动无错误。
```

------

### Phase 4：Prompt CRUD

#### 目标

主窗口可以管理 prompt。

#### 任务

1. PromptService。
2. Prompt commands。
3. 前端 promptApi。
4. PromptList。
5. PromptEditor。
6. TagInput。
7. GroupSelect。
8. 保存和删除逻辑。

#### 验收

```text
新增、编辑、删除、查看全部可用。
重启后数据仍存在。
```

------

### Phase 5：快速搜索

#### 目标

quick-search 可以检索 prompt。

#### 任务

1. SearchService。
2. search_prompts command。
3. QuickSearchBox。
4. QuickSearchResultList。
5. 键盘选择。
6. 空状态展示。
7. 加载状态展示。

#### 验收

```text
输入关键词后结果实时刷新。
上下键可选择。
Esc 可关闭。
```

------

### Phase 6：剪贴板复制

#### 目标

选中 prompt 后复制内容到剪贴板。

#### 任务

1. ClipboardService。
2. copy_to_clipboard。
3. copy_prompt_to_clipboard。
4. QuickSearchPage 回车复制。
5. mark_prompt_used。
6. toast 提示。
7. 复制后关闭窗口。

#### 验收

```text
回车后 prompt 内容可以粘贴到其他软件。
usage_count 和 last_used_at 正确更新。
```

------

### Phase 7：全局快捷键

#### 目标

全局快捷键唤起 quick-search。

#### 任务

1. ShortcutService。
2. 注册默认快捷键。
3. 触发 quick-search。
4. 防止 Pressed / Released 双触发。
5. 处理注册失败。
6. 应用退出时释放快捷键。

#### 验收

```text
在浏览器、编辑器、桌面等场景下按 Ctrl + Alt + Space 可唤起窗口。
```

------

### Phase 8：系统托盘

#### 目标

应用后台常驻。

#### 任务

1. TrayService。
2. 托盘图标。
3. 托盘菜单。
4. 关闭隐藏到托盘。
5. 退出应用。
6. 重新打开主窗口。

#### 验收

```text
关闭主窗口后应用不退出。
托盘可以打开和退出应用。
```

------

### Phase 9：设置页

#### 目标

用户可以配置基础行为。

#### 任务

1. 快捷键设置。
2. 主题设置。
3. 关闭到托盘设置。
4. 开机自启动设置。
5. 设置持久化。
6. 设置生效逻辑。

#### 验收

```text
设置保存后重启仍然生效。
快捷键修改后可重新注册。
```

------

### Phase 10：导入导出

#### 目标

支持数据备份和迁移。

#### 任务

1. JSON 导出。
2. JSON 导入。
3. 字段校验。
4. 重复处理。
5. 导入结果报告。

#### 验收

```text
导出的 JSON 可以重新导入。
导入后的 prompt 可搜索和复制。
```

------

### Phase 11：打包发布

#### 目标

生成 Windows 安装包。

#### 任务

1. 配置图标。
2. 配置 app name。
3. 配置 identifier。
4. 配置版本号。
5. 运行 build。
6. 安装测试。
7. 卸载测试。

#### 验收

```text
安装包可用。
安装后应用可正常使用。
```

------

## 4. 验收清单

### 4.1 功能验收

```text
[ ] Prompt 新增
[ ] Prompt 编辑
[ ] Prompt 删除
[ ] Prompt 搜索
[ ] 标签管理
[ ] 分组管理
[ ] 收藏
[ ] 最近使用
[ ] 快捷键唤起
[ ] 剪贴板复制
[ ] 托盘常驻
[ ] 设置保存
[ ] 导入导出
[ ] Windows 打包
```

### 4.2 体验验收

```text
[ ] 快速搜索窗口打开速度快
[ ] 输入框自动聚焦
[ ] 键盘操作顺畅
[ ] 回车复制后自动关闭
[ ] Esc 关闭自然
[ ] 复制成功有反馈
[ ] 快捷键冲突有提示
[ ] 主窗口关闭不误退出
```

### 4.3 工程验收

```text
[ ] pnpm dev 正常
[ ] pnpm lint 正常
[ ] pnpm typecheck 正常
[ ] cargo check 正常
[ ] cargo test 正常
[ ] pnpm tauri build 正常
[ ] README 完整
[ ] CODEX.md 完整
[ ] docs 完整
```

------

## 5. 风险管理

### 5.1 快捷键风险

问题：

```text
快捷键可能被系统或其他软件占用。
```

处理：

```text
提供设置页修改快捷键。
注册失败时给出明确错误。
```

### 5.2 焦点风险

问题：

```text
快速搜索窗口显示后输入框可能没有焦点。
```

处理：

```text
窗口显示后前端主动 focus。
必要时延迟 focus。
```

### 5.3 数据风险

问题：

```text
数据库损坏或误删。
```

处理：

```text
提供 JSON 导出。
后续增加自动备份。
```

### 5.4 范围膨胀风险

问题：

```text
开发过程中想加入太多功能。
```

处理：

```text
第一版严格围绕复制到剪贴板。
自动粘贴、云同步、AI API 全部延后。
```

------

## 6. README 推荐内容

README 应包含：

```text
项目简介
功能列表
技术栈
开发环境准备
安装依赖
本地运行
打包
项目结构
开发路线
贡献规范
```

推荐 README 开头：

```md
# Prompt Launcher

A lightweight local-first desktop prompt launcher.

Prompt Launcher helps you save, search, and quickly copy frequently used prompts with a global shortcut.

## Core Flow

Press global shortcut → Search prompt → Press Enter → Copy to clipboard.
```

------

## 7. 第一版完成后的复盘问题

MVP 完成后，需要回答：

1. 自己是否真的高频使用？
2. 搜索是否足够快？
3. 快捷键是否顺手？
4. prompt 管理是否麻烦？
5. 是否需要自动粘贴？
6. 是否需要变量模板？
7. 是否需要云同步？
8. 是否值得开源？
9. 是否适合写进简历？
10. 下一版最值得做什么？

------

## 8. 当前状态

MVP 所有 Phase（Phase 0 ~ Phase 11）已全部完成。

后续开发请参考 [CODEX.md](../CODEX.md) 和 [开发指南](development-guide.md)。