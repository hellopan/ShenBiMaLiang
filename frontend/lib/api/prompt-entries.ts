/**
 * @api-module /prompt-entries
 *
 * Currently: operates on in-memory Context store.
 * Future migration: replace each function body with fetch('/api/prompt-entries', ...).
 */

import type { PromptEntry } from "@/lib/types"
import { getStoreRef } from "@/lib/api/_store-ref"

export async function listPromptEntries(novelId?: string): Promise<PromptEntry[]> {
  if (novelId) return Promise.resolve(getStoreRef().getPromptEntriesForNovel(novelId))
  return Promise.resolve(getStoreRef().promptEntries)
}

export async function addPromptEntry(
  data: Omit<PromptEntry, "id" | "createdAt">,
): Promise<PromptEntry> {
  getStoreRef().addPromptEntry(data)
  // The new entry is at index 0 after prepend
  const entry = getStoreRef().promptEntries[0]
  if (!entry) throw new Error("Failed to create prompt entry")
  return Promise.resolve(entry)
}

export async function updatePromptEntry(
  id: string,
  patch: Partial<PromptEntry>,
): Promise<PromptEntry> {
  getStoreRef().updatePromptEntry(id, patch)
  const entry = getStoreRef().promptEntries.find((e) => e.id === id)
  if (!entry) throw new Error(`PromptEntry ${id} not found`)
  return Promise.resolve(entry)
}

export async function deletePromptEntry(id: string): Promise<void> {
  const entry = getStoreRef().promptEntries.find((e) => e.id === id)
  if (entry?.isSystem) throw new Error("系统词条不可删除")
  getStoreRef().deletePromptEntry(id)
  return Promise.resolve()
}
