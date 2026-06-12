"use client"

import { useMemo } from "react"
import { Copy } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useStore } from "@/lib/store"
import { buildPromptPreviewBlocks, type PromptPreviewMode } from "@/lib/prompt-preview"
import { cn } from "@/lib/utils"

export type PromptPreviewSheetProps = {
  open: boolean
  onClose: () => void
  novelId?: string
  chapterId?: string
  actId?: string
  mode: PromptPreviewMode
  activeEntryIds?: string[]
  chapterCount?: number
  actsPerChapter?: number
  testEntryId?: string
}

export function PromptPreviewSheet({
  open,
  onClose,
  novelId,
  chapterId,
  actId,
  mode,
  activeEntryIds,
  chapterCount = 10,
  actsPerChapter = 3,
  testEntryId,
}: PromptPreviewSheetProps) {
  const { novels, entries, promptEntries, getPromptEntriesForNovel } = useStore()

  const novel = novelId ? novels.find((n) => n.id === novelId) : null
  const chapter = novel?.chapters.find((c) => c.id === chapterId) ?? novel?.chapters[0]
  const actIndex = chapter?.acts.findIndex((a) => a.id === actId) ?? 0

  const { blocks, fullText, tokenEstimate } = useMemo(() => {
    const allEntries = novelId ? getPromptEntriesForNovel(novelId) : promptEntries.filter((e) => e.scope === "global")
    const testEntry = testEntryId ? promptEntries.find((e) => e.id === testEntryId) : null

    let filtered = allEntries
    if (activeEntryIds) {
      filtered = allEntries.filter((e) => activeEntryIds.includes(e.id))
    } else if (mode !== "test") {
      filtered = allEntries.filter((e) => e.active)
    }

    const enc = novelId ? entries.filter((e) => e.novelId === novelId) : []

    return buildPromptPreviewBlocks({
      mode,
      novel,
      chapter,
      actIndex,
      entries: filtered,
      encyclopediaEntries: enc,
      chapterCount,
      actsPerChapter,
      testEntry,
      entriesPreFiltered: !!activeEntryIds || mode === "test",
    })
  }, [
    novelId,
    novel,
    chapter,
    actIndex,
    mode,
    activeEntryIds,
    chapterCount,
    actsPerChapter,
    testEntryId,
    promptEntries,
    entries,
    getPromptEntriesForNovel,
  ])

  function copyAll() {
    void navigator.clipboard.writeText(fullText)
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-[480px] max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[480px]">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-base">完整提示词预览</SheetTitle>
            <Button size="sm" variant="outline" onClick={copyAll}>
              <Copy className="size-3.5" />
              复制全文
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5 py-4">
          <div className="flex flex-col gap-3">
            {blocks.map((block) => (
              <div
                key={block.id}
                className={cn(
                  "rounded-lg border border-border/60 bg-card/40 p-3 backdrop-blur-sm border-l-4",
                  block.borderClass,
                )}
              >
                <Badge variant="outline" className={cn("mb-2 text-[10px]", block.badgeClass)}>
                  {block.badge}
                </Badge>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
                  {block.content}
                </pre>
              </div>
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row items-center justify-between border-t border-border px-5 py-3">
          <span className="text-xs text-muted-foreground">
            预计 Token 数：约 {tokenEstimate.toLocaleString()}
          </span>
          <Button onClick={copyAll}>复制全文</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
