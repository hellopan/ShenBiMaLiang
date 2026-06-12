import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PromptEntry, PromptGroup } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Prompt entry ordering ─────────────────────────────────────────────────

export const GROUP_ORDER: Record<PromptGroup, number> = {
  character: 1,  // 世界观/人物背景
  scene: 2,      // 场景背景
  style: 3,      // 文风
  format: 4,     // 格式
  custom: 5,     // 自定义
  forbidden: 6,  // 禁止项（始终最后）
}

/**
 * Sort prompt entries by group order first, then by weight descending within same group.
 * Returns a new array; the original is not mutated.
 */
export function sortPromptEntries(entries: PromptEntry[]): PromptEntry[] {
  return [...entries].sort((a, b) => {
    const orderA = GROUP_ORDER[a.group] ?? 5
    const orderB = GROUP_ORDER[b.group] ?? 5
    if (orderA !== orderB) return orderA - orderB
    return b.weight - a.weight
  })
}
