// ── Act color palette ─────────────────────────────────────────────────────────
export const ACT_COLORS = [
  "#6366f1",
  "#f43f5e",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
]

export function getActColor(index: number): string {
  return ACT_COLORS[index % ACT_COLORS.length]
}

// ── Prompt library ────────────────────────────────────────────────────────────
export type PromptScope = "global" | "novel"

export type PromptGroup =
  | "style"
  | "forbidden"
  | "format"
  | "character"
  | "scene"
  | "custom"

export const PROMPT_GROUP_LABELS: Record<PromptGroup, string> = {
  style: "风格",
  forbidden: "禁止",
  format: "格式",
  character: "人物",
  scene: "场景",
  custom: "自定义",
}

export const PROMPT_GROUP_FILTER_KEYS = [
  "全部",
  "风格",
  "禁止",
  "格式",
  "人物",
  "场景",
  "自定义",
] as const

export const PROMPT_GROUP_BADGE_CLASS: Record<PromptGroup, string> = {
  style: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  forbidden: "bg-red-500/15 text-red-400 border-red-500/20",
  format: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  character: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  scene: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  custom: "bg-purple-500/15 text-purple-400 border-purple-500/20",
}

export const PROMPT_SCOPE_BADGE_CLASS: Record<PromptScope, string> = {
  global: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  novel: "bg-violet-500/15 text-violet-400 border-violet-500/20",
}

/**
 * @api-resource  GET /prompt-entries  独立实体，支持 scope=global|novel 筛选
 *
 * 每条规则词条独立存储，可被多部小说共享（scope=global）或归属某部小说（scope=novel）。
 * 后端设计：独立表，通过 novelId FK 关联 Novel。
 */
export interface PromptEntry {
  id: string
  name: string
  content: string
  scope: PromptScope
  novelId?: string
  group: PromptGroup
  weight: number
  active: boolean
  isSystem?: boolean
  createdAt: string
}

export interface ActPromptOverride {
  entryId: string
  active: boolean
}

export function resolvePromptActive(
  entry: PromptEntry,
  overrides: ActPromptOverride[] | Record<string, boolean> | undefined,
): boolean {
  if (Array.isArray(overrides)) {
    const found = overrides.find((o) => o.entryId === entry.id)
    if (found) return found.active
  } else if (overrides && entry.id in overrides) {
    return overrides[entry.id]
  }
  return entry.active
}

// ── Novel-level AI config ────────────────────────────────────────────────

/**
 * @api-config  存于 Novel 行的 outlineAIConfig / contentAIConfig JSON 列，不独立端点
 *
 * 小说级别的 AI 生成参数快照，随 Novel 整体序列化。
 * 后端设计：作为 Novel 行的两个 jsonb 列（outline_ai_config / content_ai_config）。
 */
export interface NovelAIConfig {
  model: string
  temperature: number
  topP: number
  topK: number
  maxTokens: number
  contextLength: number
}

export const DEFAULT_OUTLINE_AI_CONFIG: NovelAIConfig = {
  model: "",
  temperature: 0.3,
  topP: 0.8,
  topK: 20,
  maxTokens: 60000,
  contextLength: 128000,
}

export const DEFAULT_CONTENT_AI_CONFIG: NovelAIConfig = {
  model: "",
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 60000,
  contextLength: 128000,
}

// ── Per-act AI configuration ────────────────────────────────────────────

/**
 * @api-config  存于 Act 行的 ai_config JSON 列，不独立端点
 *
 * 幕级别的 AI 配置与规则覆盖，随 Act 整体序列化。
 * 当前仅驻留在编辑器本地 state；后端设计时建议作为 Act 行的 jsonb 列，而非独立表。
 * promptOrder 如需多端同步，可提升为独立行但暂无此需求。
 */
export interface ActAIConfig {
  actId: string
  model: string
  temperature: number
  topP: number
  topK: number
  maxTokens: number
  contextLength: number
  contextUnlocked: boolean
  /** system rule toggles (chapter outline, act outlines) */
  ruleStates: Record<string, boolean>
  promptOverrides: ActPromptOverride[]
  customRules: PromptRule[]
  /** user-applied prompt entry order (ids); overrides sortPromptEntries() when set */
  promptOrder?: string[]
}

export function makeDefaultActConfig(actId: string, model = ""): ActAIConfig {
  return {
    actId,
    model,
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxTokens: 60000,
    contextLength: 128000,
    contextUnlocked: false,
    ruleStates: {},
    promptOverrides: [],
    customRules: [],
  }
}

export type GenParams = {
  temperature: number
  topP: number
  topK: number
  contextLength: number
  maxTokens: number
  unlockContext: boolean
}

export const DEFAULT_GEN_PARAMS: GenParams = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  contextLength: 128000,
  maxTokens: 60000,
  unlockContext: false,
}

export type PromptRule = {
  id: string
  name: string
  content: string
  enabled: boolean
}

/**
 * @api-resource  嵌套于 GET /novels/:id/chapters/:id  独立实体
 *
 * Act 是章节的最小写作单元。后端设计：独立表，通过 chapterId FK 关联 Chapter。
 * ActAIConfig 作为 ai_config jsonb 列存于同一行。
 */
export type Act = {
  id: string
  outline: string
  content: string
  model?: string
}

/**
 * @api-resource  GET /novels/:id/chapters  独立实体，不内嵌在 Novel 响应中（分页加载）
 *
 * 后端设计：独立表，通过 novelId FK 关联 Novel。
 * genParams / customRules / systemRuleStates 作为 jsonb 列存于同一行。
 */
export type Chapter = {
  id: string
  title: string
  outline: string
  acts: Act[]
  expanded?: boolean
  genParams?: GenParams
  customRules?: PromptRule[]
  systemRuleStates?: Record<string, boolean>
}

/**
 * @api-resource  GET /novels/:id  独立实体，不内嵌 chapters（chapters 单独分页请求）
 *
 * 后端设计：独立表。outlineAIConfig / contentAIConfig 作为两个 jsonb 列。
 * chapters 字段仅在前端内存中使用，API 响应不包含此字段。
 */
export type Novel = {
  id: string
  title: string
  genre: string
  synopsis: string
  chapters: Chapter[]
  updatedAt: number
  createdAt?: number
  targetWordCount?: number
  narrativePerspective?: string
  storyTone?: string
  plotPacing?: string
  romanceLine?: string
  conflictType?: string
  outlineAIConfig?: NovelAIConfig
  contentAIConfig?: NovelAIConfig
}

export type Provider = "OpenAI" | "Anthropic" | "DeepSeek" | "Custom"

/**
 * @api-resource  GET /models  独立实体
 *
 * 用户配置的 LLM 模型接入信息。后端设计：独立表，apiKey 加密存储。
 */
export type ModelConfig = {
  id: string
  label: string
  provider: Provider
  modelName: string
  apiKey: string
  baseUrl?: string
  maxTokens: number
  active: boolean
}

export type EntryCategory = "角色" | "地名" | "物品" | "功法"

/**
 * @api-resource  GET /novels/:id/entries  独立实体（世界观词条）
 *
 * 每条世界观词条归属某部小说（novelId），支持关键词触发插入上下文。
 * 后端设计：独立表，通过 novelId FK 关联 Novel。keywords 可存为 text[] 或 json。
 */
export type Entry = {
  id: string
  title: string
  category: string
  content: string
  keywords: string[]
  regexPatterns: string
  weight: number
  active: boolean
  novelId?: string
}

export function wordCount(text: string): number {
  if (!text) return 0
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const nonCjk = (text.replace(/[\u4e00-\u9fa5]/g, " ").match(/[A-Za-z0-9]+/g) || []).length
  return cjk + nonCjk
}

export function chapterWordCount(chapter: Chapter): number {
  return chapter.acts.reduce((sum, a) => sum + wordCount(a.content), 0)
}

export function novelWordCount(novel: Novel): number {
  return novel.chapters.reduce((sum, c) => sum + chapterWordCount(c), 0)
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return "刚刚"
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小时前`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} 天前`
  const month = Math.floor(day / 30)
  return `${month} 个月前`
}
