import type { Entry } from "@/lib/types"

export const ENTRY_CATEGORIES = ["角色", "地点", "物品", "组织", "力量体系"] as const
export type EntryCategory = (typeof ENTRY_CATEGORIES)[number]

export function buildEntryFilters(entries: Entry[], novelId: string): string[] {
  const presetSet = new Set<string>(ENTRY_CATEGORIES)
  const custom = new Set<string>()
  for (const e of entries) {
    if (e.novelId === novelId && e.category && !presetSet.has(e.category)) {
      custom.add(e.category)
    }
  }
  return ["全部", ...ENTRY_CATEGORIES, ...[...custom].sort()]
}
