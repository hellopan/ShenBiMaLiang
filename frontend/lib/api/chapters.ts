/**
 * @api-module /novels/:novelId/chapters
 *
 * Currently: operates on in-memory Context store via updateNovel.
 * Future migration: replace each function body with fetch('/api/novels/:id/chapters', ...).
 */

import type { Chapter, Act } from "@/lib/types"
import { getStoreRef } from "@/lib/api/_store-ref"

export async function addChapter(novelId: string, data: Partial<Chapter> & { title: string }): Promise<Chapter> {
  const id = getStoreRef().addChapter(novelId, data)
  const chapter = getStoreRef().novels
    .find((n) => n.id === novelId)
    ?.chapters.find((c) => c.id === id)
  if (!chapter) throw new Error("Failed to create chapter")
  return Promise.resolve(chapter)
}

export async function updateChapter(
  novelId: string,
  chapterId: string,
  patch: Partial<Omit<Chapter, "id" | "acts">>,
): Promise<void> {
  getStoreRef().updateNovel(novelId, (n) => ({
    ...n,
    chapters: n.chapters.map((c) => (c.id === chapterId ? { ...c, ...patch } : c)),
  }))
  return Promise.resolve()
}

export async function deleteChapter(novelId: string, chapterId: string): Promise<void> {
  getStoreRef().deleteChapter(novelId, chapterId)
  return Promise.resolve()
}

export async function addAct(novelId: string, chapterId: string, data?: Partial<Act>): Promise<Act> {
  const id = getStoreRef().addAct(novelId, chapterId, data)
  const act = getStoreRef().novels
    .find((n) => n.id === novelId)
    ?.chapters.find((c) => c.id === chapterId)
    ?.acts.find((a) => a.id === id)
  if (!act) throw new Error("Failed to create act")
  return Promise.resolve(act)
}

export async function updateAct(
  novelId: string,
  chapterId: string,
  actId: string,
  patch: Partial<Act>,
): Promise<void> {
  getStoreRef().updateNovel(novelId, (n) => ({
    ...n,
    chapters: n.chapters.map((c) =>
      c.id === chapterId
        ? { ...c, acts: c.acts.map((a) => (a.id === actId ? { ...a, ...patch } : a)) }
        : c,
    ),
  }))
  return Promise.resolve()
}

export async function deleteAct(novelId: string, chapterId: string, actId: string): Promise<void> {
  getStoreRef().updateNovel(novelId, (n) => ({
    ...n,
    chapters: n.chapters.map((c) =>
      c.id === chapterId ? { ...c, acts: c.acts.filter((a) => a.id !== actId) } : c,
    ),
  }))
  return Promise.resolve()
}
