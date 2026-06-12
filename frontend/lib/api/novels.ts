/**
 * @api-module /novels
 *
 * Currently: operates on in-memory Context store.
 * Future migration: replace each function body with fetch('/api/novels', ...).
 */

import type { Novel } from "@/lib/types"
import { getStoreRef } from "@/lib/api/_store-ref"

export async function listNovels(): Promise<Novel[]> {
  return Promise.resolve(getStoreRef().novels)
}

export async function getNovel(id: string): Promise<Novel | null> {
  return Promise.resolve(getStoreRef().novels.find((n) => n.id === id) ?? null)
}

export async function createNovel(data: {
  title: string
  genre: string
  synopsis: string
}): Promise<Novel> {
  const id = getStoreRef().createNovel(data)
  const novel = getStoreRef().novels.find((n) => n.id === id)
  if (!novel) throw new Error("Failed to create novel")
  return Promise.resolve(novel)
}

export async function updateNovel(
  id: string,
  patch: Partial<Omit<Novel, "id" | "createdAt" | "updatedAt">>,
): Promise<Novel> {
  getStoreRef().updateNovel(id, (n) => ({ ...n, ...patch }))
  const novel = getStoreRef().novels.find((n) => n.id === id)
  if (!novel) throw new Error(`Novel ${id} not found`)
  return Promise.resolve(novel)
}

export async function deleteNovel(id: string): Promise<void> {
  getStoreRef().deleteNovel(id)
  return Promise.resolve()
}
