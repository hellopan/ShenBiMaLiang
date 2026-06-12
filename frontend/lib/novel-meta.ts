import type { Novel } from "@/lib/types"
import { parseGenres } from "@/lib/genres"

export const NARRATIVE_PERSPECTIVES = [
  "第一人称",
  "第三人称有限",
  "第三人称全知",
] as const

export const STORY_TONES = [
  "热血",
  "治愈",
  "悬疑",
  "搞笑",
  "悲伤",
  "史诗",
  "黑暗",
  "轻松",
  "浪漫",
] as const

export const PLOT_PACINGS = ["快节奏", "中等偏快", "中等", "中等偏慢", "慢热铺垫"] as const

export const ROMANCE_LINE_PRESETS = [
  "无感情线",
  "单 CP 主线",
  "多 CP",
  "慢热暧昧",
  "虐恋",
  "甜宠",
  "BE 结局",
] as const

export const CONFLICT_TYPE_PRESETS = [
  "人 vs 人",
  "人 vs 自然",
  "人 vs 社会",
  "人 vs 自我",
  "阵营对抗",
  "悬疑解谜",
  "生存挑战",
  "成长蜕变",
] as const

/** Format target word count for AI prompt context (e.g. 3000000 → "300万字"). */
export function formatTargetWordCountForPrompt(count?: number): string | null {
  if (!count || count <= 0) return null
  if (count >= 10000) return `${count / 10000}万字`
  return `${count.toLocaleString()}字`
}

function joinTags(value: string | undefined, separator: string): string | null {
  const tags = parseGenres(value ?? "")
  if (!tags.length) return null
  return tags.join(separator)
}

/**
 * Build [小说基本信息] block for prompt preview.
 * Omit lines for unfilled optional fields.
 */
export function buildNovelBasicInfoContent(novel: Novel): string {
  const lines: string[] = [`书名：${novel.title}`]

  if (novel.genre.trim()) lines.push(`题材：${novel.genre}`)
  if (novel.synopsis.trim()) lines.push(`简介：${novel.synopsis}`)

  const targetWords = formatTargetWordCountForPrompt(novel.targetWordCount)
  if (targetWords) lines.push(`目标字数：${targetWords}`)

  if (novel.narrativePerspective?.trim()) {
    lines.push(`叙事视角：${novel.narrativePerspective}`)
  }

  const tone = joinTags(novel.storyTone, "、")
  if (tone) lines.push(`故事基调：${tone}`)

  if (novel.plotPacing?.trim()) lines.push(`剧情节奏：${novel.plotPacing}`)

  const romance = joinTags(novel.romanceLine, "，")
  if (romance) lines.push(`感情线设置：${romance}`)

  const conflict = joinTags(novel.conflictType, " + ")
  if (conflict) lines.push(`主要冲突类型：${conflict}`)

  return lines.join("\n")
}
