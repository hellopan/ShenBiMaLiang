/**
 * @api-module /ai
 *
 * Currently: calls external LLM API directly from the browser.
 * Future migration: move this function to a Next.js API route
 * (app/api/ai/recommend-order/route.ts) and replace the body here with:
 *   return fetch('/api/ai/recommend-order', { method: 'POST', body: JSON.stringify(params) }).then(r => r.json())
 *
 * This file is intentionally kept separate so the component never imports fetch logic directly.
 */

import type { PromptEntry } from "@/lib/types"
import type { PromptPreviewMode } from "@/lib/prompt-preview"
import type { ModelConfig } from "@/lib/types"
import { sortPromptEntries } from "@/lib/utils"

const MODE_LABELS: Record<PromptPreviewMode, string> = {
  outline: "大纲生成",
  expand: "正文扩写",
  test: "词条测试",
}

export type AiSortResult = {
  order: string[]
  reasons: Record<string, string>
  summary: string
}

export type RecommendOrderParams = {
  entries: PromptEntry[]
  mode: PromptPreviewMode
  model: ModelConfig
}

export async function recommendOrder({
  entries,
  mode,
  model,
}: RecommendOrderParams): Promise<AiSortResult> {
  const modeLabel = MODE_LABELS[mode]
  const entryList = sortPromptEntries(entries)
    .map((e, i) => `${i + 1}. [${e.group}] ${e.name}：${e.content.slice(0, 50)}`)
    .join("\n")

  const prompt = `你是一个提示词工程专家。以下是用于「${modeLabel}」任务的提示词词条列表。
请根据大语言模型的注意力机制（首因效应、近因效应、中间遗忘），为这些词条推荐最优排列顺序。

任务类型：${modeLabel}
当前词条列表：
${entryList}

请返回 JSON 格式：
{
  "order": ["词条id1", "词条id2"],
  "reasons": {
    "词条id1": "放在首位的理由（15字以内）"
  },
  "summary": "整体排序策略说明（50字以内）"
}
只返回 JSON，不要其他内容。`

  let rawText: string

  if (model.provider === "Anthropic") {
    const base = model.baseUrl?.replace(/\/+$/, "") ?? "https://api.anthropic.com"
    const response = await fetch(`${base}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": model.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model.modelName,
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    })
    if (!response.ok) throw new Error(`API error ${response.status}`)
    const data = await response.json()
    rawText = data.content?.[0]?.text ?? ""
  } else {
    // OpenAI-compatible (DeepSeek, GPT, etc.)
    const base = model.baseUrl?.replace(/\/+$/, "") ?? "https://api.openai.com/v1"
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${model.apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelName,
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    })
    if (!response.ok) throw new Error(`API error ${response.status}`)
    const data = await response.json()
    rawText = data.choices?.[0]?.message?.content ?? ""
  }

  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("无法解析返回的 JSON")
  return JSON.parse(jsonMatch[0]) as AiSortResult
}
