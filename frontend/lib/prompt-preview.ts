import type { Chapter, Entry, Novel, PromptEntry } from "@/lib/types"
import { PROMPT_GROUP_LABELS } from "@/lib/types"
import { sortPromptEntries } from "@/lib/utils"

export type PromptPreviewMode = "outline" | "expand" | "test"

export type PromptPreviewBlock = {
  id: string
  badge: string
  badgeClass: string
  borderClass: string
  title?: string
  content: string
}

const GROUP_EMOJI: Record<string, string> = {
  style: "🎨",
  forbidden: "🚫",
  format: "📐",
  character: "👤",
  scene: "🏞",
  custom: "✨",
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function buildPromptPreviewBlocks(options: {
  mode: PromptPreviewMode
  novel?: Novel | null
  chapter?: Chapter | null
  actIndex?: number
  entries?: PromptEntry[]
  encyclopediaEntries?: Entry[]
  chapterCount?: number
  actsPerChapter?: number
  testEntry?: PromptEntry | null
  /** When true, use all entries passed in without filtering by active */
  entriesPreFiltered?: boolean
}): { blocks: PromptPreviewBlock[]; fullText: string; tokenEstimate: number } {
  const {
    mode,
    novel,
    chapter,
    actIndex = 0,
    entries = [],
    encyclopediaEntries = [],
    chapterCount = 10,
    actsPerChapter = 3,
    testEntry,
    entriesPreFiltered = false,
  } = options

  const blocks: PromptPreviewBlock[] = []

  blocks.push({
    id: "system",
    badge: "系统提示词",
    badgeClass: "bg-muted text-muted-foreground",
    borderClass: "border-l-muted-foreground/40",
    content: "你是一个专业网文写作助手，擅长中文网络小说创作，能够根据背景设定与规则词条生成高质量内容。",
  })

  if (novel) {
    blocks.push({
      id: "novel",
      badge: "小说背景",
      badgeClass: "bg-blue-500/15 text-blue-400",
      borderClass: "border-l-blue-500/60",
      content: `书名：${novel.title}\n类型：${novel.genre}\n简介：${novel.synopsis || "暂无"}`,
    })
  }

  const activeEntries =
    mode === "test" && testEntry
      ? [testEntry]
      : entriesPreFiltered
        ? entries
        : sortPromptEntries(entries.filter((e) => e.active))

  if (activeEntries.length > 0) {
    activeEntries.forEach((entry) => {
      const emoji = GROUP_EMOJI[entry.group] ?? "✨"
      blocks.push({
        id: entry.id,
        badge: `${emoji} ${PROMPT_GROUP_LABELS[entry.group]} · ${entry.name}`,
        badgeClass: "",
        borderClass:
          entry.group === "style"
            ? "border-l-indigo-500/60"
            : entry.group === "forbidden"
              ? "border-l-red-500/60"
              : entry.group === "format"
                ? "border-l-amber-500/60"
                : "border-l-purple-500/60",
        content: entry.content,
      })
    })
  }

  const topEntries = encyclopediaEntries
    .filter((e) => e.active)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)

  if (topEntries.length > 0 && mode !== "test") {
    blocks.push({
      id: "encyclopedia",
      badge: "世界观词条",
      badgeClass: "bg-purple-500/15 text-purple-400",
      borderClass: "border-l-purple-500/60",
      content: topEntries
        .map((e) => `${e.title}（权重${e.weight}）：${e.content}`)
        .join("\n\n"),
    })
  }

  let taskContent = ""
  if (mode === "outline") {
    taskContent = `请生成 ${chapterCount} 章大纲，每章 ${actsPerChapter} 幕。基于小说简介、启用的提示词词条与世界观词条，输出章节标题、章节概要与各幕概要。`
  } else if (mode === "expand") {
    const actNum = actIndex + 1
    const actOutline = chapter?.acts[actIndex]?.outline ?? ""
    taskContent = `请根据以上背景扩写第 ${actNum} 幕正文内容。\n\n本幕概要：${actOutline || "（未填写）"}`
  } else if (mode === "test") {
    taskContent = "（测试模式：仅预览单条词条注入效果）"
  }

  if (taskContent) {
    blocks.push({
      id: "task",
      badge: "任务指令",
      badgeClass: "bg-indigo-500/15 text-indigo-400",
      borderClass: "border-l-indigo-500/60",
      content: taskContent,
    })
  }

  const fullText = blocks.map((b) => `[${b.badge}]\n${b.content}`).join("\n\n---\n\n")
  return { blocks, fullText, tokenEstimate: estimateTokens(fullText) }
}
