export type GenParams = {
  temperature: number
  topP: number
  topK: number
  contextLength: number
  maxReplyLength: number
  unlockContext: boolean
}

export const DEFAULT_GEN_PARAMS: GenParams = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  contextLength: 128000,
  maxReplyLength: 60000,
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
  modelId?: string
}

export type Chapter = {
  id: string
  title: string
  outline: string
  acts: Act[]
  expanded?: boolean
  stylePrompt?: string
  forbidPrompt?: string
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
