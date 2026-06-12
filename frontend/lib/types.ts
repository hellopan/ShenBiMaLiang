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

export type Act = {
  id: string
  outline: string
  content: string
  model?: string
}

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

export type Novel = {
  id: string
  title: string
  genre: string
  synopsis: string
  chapters: Chapter[]
  updatedAt: number
  createdAt?: number
  targetWordCount?: number
  writingLanguage?: string
  outlineAIConfig?: NovelAIConfig
  contentAIConfig?: NovelAIConfig
}

export type Provider = "OpenAI" | "Anthropic" | "DeepSeek" | "Custom"

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
