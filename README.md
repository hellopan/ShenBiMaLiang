# 神笔马良

AI 辅助网文创作工作台，支持章节/幕结构写作、提示词词条库、世界观词条管理与多模型配置。

> 当前版本：**v0.4.0-alpha** · 开源协议：**AGPL v3** · 仓库：[github.com/hellopan/ShenBiMaLiang](https://github.com/hellopan/ShenBiMaLiang)

---

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [仓库目录结构](#仓库目录结构)
- [路由与页面](#路由与页面)
- [组件与模块](#组件与模块)
- [功能说明](#功能说明)
- [提示词系统](#提示词系统)
- [前端架构](#前端架构)
- [数据模型](#数据模型)
- [主题系统](#主题系统)
- [后续规划](#后续规划)
- [开发与贡献](#开发与贡献)

---

## 项目简介

**神笔马良** 是一款面向网文创作者的工具，围绕「章节 → 幕」的分层写作流程设计，提供：

- **提示词词条库**：全局与小说级词条，按分组（风格/禁止/格式/人物/场景/自定义）与权重管理
- **分层规则注入**：系统词条 → 继承词条 → 幕级自定义规则
- **完整提示词预览**：大纲/扩写/测试三种模式，支持默认排序、拖拽自定义与 AI 推荐排序
- **世界观词条**：关键词/正则关联，生成时按权重注入
- **多模型配置**：OpenAI / Anthropic / DeepSeek / Custom

当前仓库以 **Next.js 前端原型** 为主，数据保存在 React Context 内存中（刷新后重置为 seed 数据）。大纲生成与正文扩写仍为 UI mock；**AI 推荐排序**在配置有效 API Key 时会真实调用所选模型。

---

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Next.js 16（App Router）+ React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 + `frontend/app/globals.css` |
| UI | shadcn/ui（Base UI）+ Lucide 图标 |
| 主题 | next-themes（glass / light / dark） |
| 状态 | React Context — `frontend/lib/store.tsx`（内存 seed 数据） |
| 包管理 | pnpm |

---

## 快速开始

```bash
cd frontend
pnpm install
pnpm dev      # 默认 http://localhost:3000
pnpm build
pnpm start
pnpm lint
```

---

## 仓库目录结构

```
ShenBiMaLiang/
├── frontend/                 # Next.js 前端（当前主要代码）
│   ├── app/                  # App Router 页面与全局样式
│   ├── components/           # 业务组件 + ui/
│   ├── lib/                  # store、types、utils、prompt-preview
│   ├── public/               # 静态资源
│   ├── package.json
│   └── components.json       # shadcn 配置
└── docs/
    └── 架构设计v1.md          # 后端/全栈规划（尚未实现）
```

### `frontend/app/` 页面文件

```
app/
├── layout.tsx              # 根布局：ThemeProvider、StoreProvider、渐变背景
├── globals.css             # 全局样式与三主题 CSS 变量
├── page.tsx                # 首页 · 我的书架
├── about/page.tsx          # 关于 · 版本与更新日志
├── settings/page.tsx       # 设置 · 模型配置与主题
├── inspiration/page.tsx    # 灵感片段（占位）
├── prompts/page.tsx        # 提示词库（全局 + 小说级词条）
├── stats/page.tsx          # 统计分析（占位）
├── logs/page.tsx           # 请求日志（占位）
├── novel/[id]/page.tsx     # 小说详情（多 Section 单页应用）
└── editor/[id]/page.tsx    # 章节幕编辑器
```

---

## 路由与页面

| 路由 | 文件 | 状态 |
|------|------|------|
| `/` | `app/page.tsx` | ✅ 书架、搜索、新建/删除小说 |
| `/novel/[id]` | `app/novel/[id]/page.tsx` | ✅ 多 Section 详情（总览/基本信息/大纲/章节/词条/提示词/导出等） |
| `/editor/[id]` | `app/editor/[id]/page.tsx` | ✅ 章节幕编辑器 + AI 提示词面板 |
| `/prompts` | `app/prompts/page.tsx` | ✅ 全局提示词库 |
| `/settings` | `app/settings/page.tsx` | ✅ 模型配置、主题切换 |
| `/inspiration` | `app/inspiration/page.tsx` | 🔜 占位：即将推出 |
| `/stats` | `app/stats/page.tsx` | 🔜 占位：即将推出 |
| `/logs` | `app/logs/page.tsx` | 🔜 占位：即将推出 |
| `/about` | `app/about/page.tsx` | ✅ 版本与更新日志 |

---

## 组件与模块

### `frontend/components/`

```
components/
├── layout/
│   └── app-sidebar.tsx         # 全局侧栏（home / novel 两种模式）
├── prompts/
│   ├── prompt-entries-panel.tsx    # 共享词条面板（筛选/卡片/override 模式）
│   ├── prompt-entry-card.tsx       # 词条卡片
│   ├── prompt-entry-dialog.tsx     # 新建/编辑词条对话框
│   ├── prompt-preview-sheet.tsx    # 完整提示词预览（含排序控制）
│   └── novel-ai-config-form.tsx    # 小说级 AI 参数表单
├── editor/
│   ├── chapter-sidebar.tsx     # 编辑器左侧章节/幕导航
│   ├── chapter-editor.tsx      # 幕大纲与正文编辑（含扩写预览按钮）
│   └── ai-prompts-panel.tsx    # 右侧 AI 规则/参数/模型配置
├── encyclopedia/
│   └── encyclopedia-panel.tsx
├── ui/                         # shadcn 基础组件（共 19 个）
├── new-novel-dialog.tsx
├── model-dialog.tsx
├── entry-dialog.tsx
├── novel-card.tsx
├── app-logo.tsx
└── theme-provider.tsx
```

### `frontend/lib/`

| 文件 | 职责 |
|------|------|
| `types.ts` | 核心类型：`Novel` / `PromptEntry` / `ActAIConfig` / `ModelConfig` / `Entry` 等 |
| `store.tsx` | 全局状态（React Context）、seed 数据、`promptEntries` CRUD |
| `prompt-preview.ts` | 组装完整提示词分块、Token 估算 |
| `utils.ts` | `cn()`、`sortPromptEntries()`、`GROUP_ORDER` |

---

## 功能说明

### ✅ 已实现

#### 书架（`/`）

- 小说卡片展示（类型渐变封面、字数、更新时间）
- 悬停操作：打开详情、删除
- 搜索书名/类型、筛选「全部 / 最近更新」
- 新建小说对话框

#### 提示词库（`/prompts`）

- 管理全局与小说级提示词词条
- 按作用域、分组筛选与搜索
- 新建/编辑/删除词条（权重 1–10、启用开关）
- 词条对话框内「预览效果」→ 测试模式预览 Sheet

#### 小说详情（`/novel/[id]`）

单页多 Section，侧栏切换（`AppSidebar mode="novel"`）：

| Section | 说明 |
|---------|------|
| 总览 | 封面、统计、写作进度、跳转编辑器/大纲 |
| 基本信息 | 标题、类型、简介、目标字数、写作语言 |
| 大纲生成 | 大纲 AI 参数、词条选择（本地 override）、完整提示词预览、模拟生成 |
| 章节概览 | 正文生成默认配置（折叠）、章节列表与字数统计 |
| 世界词条 | CRUD、分类、关键词/正则、权重 |
| 提示词 | 嵌入 `PromptEntriesPanel`，管理本书相关词条 |
| 导出 | 导出 TXT（DOCX 占位） |

> 原「写作配置」已移除：文风/禁止提示词迁入提示词库；AI 参数分别在大纲生成与章节概览中配置。

#### 编辑器（`/editor/[id]`）

- 三栏布局：章节/幕侧栏 · 幕编辑器 · AI 提示词面板
- 章节/幕树：新增章节、展开折叠、切换幕
- 幕编辑：大纲与正文、字数统计、扩写（mock 流式）、👁 预览提示词
- **规则词条（三层）**：
  - **系统词条**：章节大纲、各幕概要（只读映射，可开关）
  - **继承词条**：来自提示词库的活跃词条，可按幕 override 启用状态
  - **本幕自定义**：仅当前幕有效的 `PromptRule`
- 按幕 AI 配置：模型、temperature/topP/topK、上下文长度、`promptOrder` 自定义排序

#### 设置（`/settings`）

- 多 Provider 模型接入：OpenAI / Anthropic / DeepSeek / Custom
- 模型 CRUD、启用/禁用
- 主题切换：毛玻璃 / 浅色 / 深色

#### 其他

- **世界观词条**（小说详情 Section · 世界词条）
- **关于**（`/about`）：更新日志与版本信息

### 🔜 占位 / 规划中

| 功能 | 说明 |
|------|------|
| 灵感片段 | 页面已建，标注「即将推出」 |
| 统计分析 | 写作字数趋势、Token 用量 |
| 请求日志 | AI 接口调用记录 |
| 时间线 / 人物状态 / 人物关系图 | 小说详情 Section 占位 |
| 真实大纲/扩写 LLM 调用 | 当前为前端 mock |
| 数据持久化 | 刷新后恢复 seed 数据 |
| 后端服务 | FastAPI + SQLite，见 `docs/架构设计v1.md` |

---

## 提示词系统

### 词条模型（`PromptEntry`）

| 字段 | 说明 |
|------|------|
| `scope` | `global` 全局 / `novel` 小说级 |
| `group` | 风格 / 禁止 / 格式 / 人物 / 场景 / 自定义 |
| `weight` | 1–10，同组内越高越优先 |
| `active` | 是否默认启用 |
| `isSystem` | 系统内置词条不可删除 |

### 默认排序（`sortPromptEntries`）

组装最终提示词时，词条按以下分组顺序排列，同组内按 `weight` 降序：

```
人物(1) → 场景(2) → 风格(3) → 格式(4) → 自定义(5) → 禁止(6)
```

系统词条（章节大纲、幕概要）始终排在所有 `PromptEntry` 之前。

### 完整提示词预览（`PromptPreviewSheet`）

右侧 480px Sheet，分块展示：

1. 系统提示词  
2. 小说背景  
3. 启用的词条（按当前排序）  
4. 世界观词条（权重 Top 5）  
5. 任务指令（大纲 / 扩写 / 测试）

**三种排序模式：**

| 模式 | 行为 |
|------|------|
| 默认排序 | `sortPromptEntries()` 顺序，显示 `#N` 位置编号 |
| 自定义排序 | HTML5 拖拽重排，关闭 Sheet 后重置（大纲模式仅会话内） |
| AI 推荐排序 | 选择模型 → 分析词条 → 展示推荐顺序与理由 → 可应用 |

**持久化：** `mode="expand"` 时应用自定义/AI 顺序会写入 `ActAIConfig.promptOrder`；大纲生成场景的 override 仅本地状态，不持久化。

### 规则注入层级（编辑器）

```
规则词条
├── 系统词条     章节大纲、第 N 幕概要
├── 继承词条     提示词库中本小说可用词条（可按幕 override 启用）
└── 本幕自定义   仅当前幕的 PromptRule
```

---

## 前端架构

```mermaid
flowchart TB
  subgraph pages [App Router Pages]
    Home["/ 书架"]
    Prompts["/prompts 提示词库"]
    NovelDetail["/novel/id 详情"]
    Editor["/editor/id 编辑器"]
    Settings["/settings 设置"]
  end

  subgraph layout [Layout Layer]
    Sidebar[AppSidebar]
    Theme[ThemeProvider]
    Store[StoreProvider]
  end

  subgraph state [State and Types]
    StoreCtx["lib/store.tsx"]
    Types["lib/types.ts"]
    Preview["lib/prompt-preview.ts"]
  end

  Home --> Sidebar
  Prompts --> Sidebar
  NovelDetail --> Sidebar
  Editor --> StoreCtx
  Settings --> StoreCtx
  Theme --> pages
  Store --> StoreCtx
  StoreCtx --> Types
  Preview --> Types
```

**数据流概要：**

1. `app/layout.tsx` 挂载 `ThemeProvider` → `StoreProvider` → `TooltipProvider`
2. 各页面通过 `useStore()` 读写小说、模型、词条、`promptEntries`
3. 编辑器按幕维护独立的 `ActAIConfig`（模型参数、`promptOverrides`、`promptOrder`）
4. `PromptPreviewSheet` 调用 `buildPromptPreviewBlocks()` 组装预览内容

---

## 数据模型

核心类型定义于 `frontend/lib/types.ts`：

```
PromptEntry
├── scope: global | novel
├── group: style | forbidden | format | character | scene | custom
├── weight, active, isSystem?
└── novelId?（小说级时关联）

Novel
├── id, title, genre, synopsis
├── outlineAIConfig / contentAIConfig   # 大纲/正文默认 AI 参数
├── chapters: Chapter[]
│   ├── title, outline
│   └── acts: Act[]                   # 幕：outline + content
└── targetWordCount, writingLanguage

ActAIConfig（按幕，内存态）
├── model, temperature, topP, topK, maxTokens, contextLength
├── ruleStates                        # 系统词条开关
├── promptOverrides[]                 # 继承词条启用 override
├── customRules: PromptRule[]         # 本幕自定义
└── promptOrder?: string[]             # 自定义词条顺序

ModelConfig                         # 多模型 API 配置
├── provider, modelName, apiKey
└── baseUrl, maxTokens, active

Entry                               # 世界观词条
├── category, content
├── keywords, regexPatterns
├── weight, active
└── novelId（可选关联）
```

**字数统计：** `wordCount()` 支持中英文混合计数，聚合至章节/小说总量。

---

## 主题系统

三套主题通过 `next-themes` 管理，在 **设置 → 主题外观** 切换，选择持久化至 localStorage。

| 主题 | 说明 |
|------|------|
| `glass`（默认） | 毛玻璃暗色风格，渐变背景 + 装饰光斑 |
| `light` | 浅色实色界面 |
| `dark` | 深色实色界面 |

相关文件：

- `frontend/app/layout.tsx` — `ThemeProvider` 配置（`defaultTheme="glass"`）
- `frontend/app/globals.css` — 各主题 CSS 变量与 glass 特效
- `frontend/app/settings/page.tsx` — 主题切换 UI

---

## 后续规划

完整架构设计见 [`docs/架构设计v1.md`](docs/架构设计v1.md)，规划内容包括：

- FastAPI 后端 + SQLite 持久化
- LLM 流式输出与 Prompt 编排
- 关键词/正则触发的词条自动注入
- Chroma 向量检索（按需）

> **说明：** 架构文档中前端技术栈写为 React + Vite，当前仓库已演进为 **Next.js App Router**；后端代码尚未入库。

---

## 开发与贡献

- **主开发分支：** `dev`
- **代码风格：** 遵循现有 shadcn/ui + Tailwind 约定，组件放 `components/`，页面放 `app/`
- **路径别名：** `@/components`、`@/lib`（见 `frontend/components.json`）

欢迎提交 Issue 与 Pull Request。
