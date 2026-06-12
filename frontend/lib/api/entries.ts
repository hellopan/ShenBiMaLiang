/**
 * @api-module /entries  (世界观词条)
 *
 * Currently: operates on in-memory Context store.
 * Future migration: replace each function body with fetch('/api/entries', ...).
 */

import type { Entry } from "@/lib/types"
import { getStoreRef } from "@/lib/api/_store-ref"

export async function listEntries(novelId?: string): Promise<Entry[]> {
  const all = getStoreRef().entries
  return Promise.resolve(novelId ? all.filter((e) => e.novelId === novelId) : all)
}

export async function addEntry(data: Omit<Entry, "id">): Promise<Entry> {
  const id = getStoreRef().addEntry(data)
  const entry = getStoreRef().entries.find((e) => e.id === id)
  if (!entry) throw new Error("Failed to create entry")
  return Promise.resolve(entry)
}

export async function updateEntry(id: string, patch: Partial<Entry>): Promise<Entry> {
  getStoreRef().updateEntry(id, patch)
  const entry = getStoreRef().entries.find((e) => e.id === id)
  if (!entry) throw new Error(`Entry ${id} not found`)
  return Promise.resolve(entry)
}

export async function deleteEntry(id: string): Promise<void> {
  getStoreRef().deleteEntry(id)
  return Promise.resolve()
}
