"use client"

import { use, useEffect, useMemo, useState } from "react"
import { notFound } from "next/navigation"
import { ChapterSidebar } from "@/components/editor/chapter-sidebar"
import { ChapterEditor } from "@/components/editor/chapter-editor"
import { AiPromptsPanel } from "@/components/editor/ai-prompts-panel"
import { useStore, uid } from "@/lib/store"
import type { Act, ActAIConfig, Chapter } from "@/lib/types"
import { makeDefaultActConfig } from "@/lib/types"

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { novels, updateNovel, models } = useStore()
  const novel = novels.find((n) => n.id === id)

  const [activeChapterId, setActiveChapterId] = useState(novel?.chapters[0]?.id ?? "")
  const [activeActId, setActiveActId] = useState<string | null>(null)
  const [actConfigs, setActConfigs] = useState<Record<string, ActAIConfig>>({})

  const activeChapter = useMemo(
    () => novel?.chapters.find((c) => c.id === activeChapterId) ?? novel?.chapters[0],
    [novel, activeChapterId],
  )

  const activeModels = useMemo(() => models.filter((m) => m.active), [models])
  const defaultModelId = activeModels[0]?.id ?? ""

  // Initialize / sync act configs whenever the active chapter changes
  useEffect(() => {
    if (!activeChapter) return
    setActConfigs((prev) => {
      const next = { ...prev }
      activeChapter.acts.forEach((act) => {
        if (!next[act.id]) {
          next[act.id] = makeDefaultActConfig(act.id, defaultModelId)
        }
      })
      return next
    })
    setActiveActId((prev) => {
      if (prev && activeChapter.acts.some((a) => a.id === prev)) return prev
      return activeChapter.acts[0]?.id ?? null
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapter?.id])

  if (!novel) return notFound()
  if (!activeChapter) return null

  // ── Chapter/act mutation helpers ────────────────────────────────────────────

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
    const newActId = uid()
    patchChapter(activeChapter!.id, (c) => ({
      ...c,
      acts: [...c.acts, { id: newActId, outline: "", content: "" }],
    }))
    setActConfigs((prev) => ({
      ...prev,
      [newActId]: makeDefaultActConfig(newActId, defaultModelId),
    }))
    setActiveActId(newActId)
  }

  function handleDeleteAct(actId: string) {
    patchChapter(activeChapter!.id, (c) => ({
      ...c,
      acts: c.acts.filter((a) => a.id !== actId),
    }))
    setActConfigs((prev) => {
      const next = { ...prev }
      delete next[actId]
      return next
    })
    if (activeActId === actId) {
      const remaining = activeChapter!.acts.filter((a) => a.id !== actId)
      setActiveActId(remaining[0]?.id ?? null)
    }
  }

  function handleChangeAct(actId: string, patch: Partial<Act>) {
    patchChapter(activeChapter!.id, (c) => ({
      ...c,
      acts: c.acts.map((a) => (a.id === actId ? { ...a, ...patch } : a)),
    }))
  }

  function handleActConfigChange(actId: string, patch: Partial<ActAIConfig>) {
    setActConfigs((prev) => ({
      ...prev,
      [actId]: {
        ...(prev[actId] ?? makeDefaultActConfig(actId, defaultModelId)),
        ...patch,
      },
    }))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
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
          activeActId={activeActId}
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
          onActFocus={setActiveActId}
          onActSettingsClick={setActiveActId}
        />
      </main>

      <AiPromptsPanel
        chapter={activeChapter}
        acts={activeChapter.acts}
        activeActId={activeActId}
        actConfigs={actConfigs}
        models={activeModels}
        onActConfigChange={handleActConfigChange}
        onUpdateChapter={(updater) => patchChapter(activeChapter.id, updater)}
      />
    </div>
  )
}
