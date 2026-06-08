"use client"

import { use, useMemo, useState } from "react"
import { notFound } from "next/navigation"
import { ChapterSidebar } from "@/components/editor/chapter-sidebar"
import { ChapterEditor } from "@/components/editor/chapter-editor"
import { AiPromptsPanel } from "@/components/editor/ai-prompts-panel"
import { useStore, uid } from "@/lib/store"
import type { Act, Chapter } from "@/lib/types"

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { novels, updateNovel, models } = useStore()
  const novel = novels.find((n) => n.id === id)

  const [activeChapterId, setActiveChapterId] = useState(novel?.chapters[0]?.id ?? "")

  const activeChapter = useMemo(
    () => novel?.chapters.find((c) => c.id === activeChapterId) ?? novel?.chapters[0],
    [novel, activeChapterId],
  )

  if (!novel) return notFound()
  if (!activeChapter) return null

  function patchChapter(chapterId: string, updater: (c: Chapter) => Chapter) {
    updateNovel(novel!.id, (n) => ({
      ...n,
      chapters: n.chapters.map((c) => (c.id === chapterId ? updater(c) : c)),
    }))
  }

  function handleAddChapter() {
    const newId = uid()
    updateNovel(novel!.id, (n) => ({
      ...n,
      chapters: [
        ...n.chapters,
        {
          id: newId,
          title: `第${n.chapters.length + 1}章`,
          outline: "",
          expanded: true,
          acts: [{ id: uid(), outline: "", content: "" }],
        },
      ],
    }))
    setActiveChapterId(newId)
  }

  function handleToggleExpand(chapterId: string) {
    patchChapter(chapterId, (c) => ({ ...c, expanded: !c.expanded }))
  }

  function handleAddAct() {
    patchChapter(activeChapter!.id, (c) => ({
      ...c,
      acts: [...c.acts, { id: uid(), outline: "", content: "" }],
    }))
  }

  function handleDeleteAct(actId: string) {
    patchChapter(activeChapter!.id, (c) => ({
      ...c,
      acts: c.acts.filter((a) => a.id !== actId),
    }))
  }

  function handleChangeAct(actId: string, patch: Partial<Act>) {
    patchChapter(activeChapter!.id, (c) => ({
      ...c,
      acts: c.acts.map((a) => (a.id === actId ? { ...a, ...patch } : a)),
    }))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChapterSidebar
        novel={novel}
        activeChapterId={activeChapter.id}
        onSelectChapter={setActiveChapterId}
        onToggleExpand={handleToggleExpand}
        onAddChapter={handleAddChapter}
      />

      <main className="flex-1 overflow-y-auto">
        <ChapterEditor
          chapter={activeChapter}
          models={models}
          onChangeTitle={(title) => patchChapter(activeChapter.id, (c) => ({ ...c, title }))}
          onChangeOutline={(outline) =>
            patchChapter(activeChapter.id, (c) => ({ ...c, outline }))
          }
          onChangeStylePrompt={(stylePrompt) =>
            patchChapter(activeChapter.id, (c) => ({ ...c, stylePrompt }))
          }
          onChangeForbidPrompt={(forbidPrompt) =>
            patchChapter(activeChapter.id, (c) => ({ ...c, forbidPrompt }))
          }
          onChangeAct={handleChangeAct}
          onAddAct={handleAddAct}
          onDeleteAct={handleDeleteAct}
        />
      </main>

      <AiPromptsPanel
        chapter={activeChapter}
        onUpdateChapter={(updater) => patchChapter(activeChapter.id, updater)}
      />
    </div>
  )
}
