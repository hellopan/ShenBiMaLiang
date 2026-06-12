"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Copy, GripVertical, RefreshCw, Sparkles, X } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { buildPromptPreviewBlocks, type PromptPreviewMode } from "@/lib/prompt-preview"
import { cn, sortPromptEntries } from "@/lib/utils"
import type { PromptEntry } from "@/lib/types"
import { PROMPT_GROUP_BADGE_CLASS, PROMPT_GROUP_LABELS } from "@/lib/types"
import { recommendOrder, type AiSortResult } from "@/lib/api/ai"

// ── Types ─────────────────────────────────────────────────────────────────

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
  initialPromptOrder?: string[]
  onApplyOrder?: (order: string[]) => void
}

type SortMode = "default" | "custom" | "ai"

type AiSortState = {
  loading: boolean
  result: AiSortResult | null
  error: string | null
}

const MODE_LABELS: Record<PromptPreviewMode, string> = {
  outline: "大纲生成",
  expand: "正文扩写",
  test: "词条测试",
}

const GROUP_EMOJI: Record<string, string> = {
  style: "🎨",
  forbidden: "🚫",
  format: "📐",
  character: "👤",
  scene: "🏞",
  custom: "✨",
}

// ── Component ─────────────────────────────────────────────────────────────

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
  initialPromptOrder,
  onApplyOrder,
}: PromptPreviewSheetProps) {
  const { novels, entries, promptEntries, models, getPromptEntriesForNovel } = useStore()

  const novel = novelId ? novels.find((n) => n.id === novelId) : null
  const chapter = novel?.chapters.find((c) => c.id === chapterId) ?? novel?.chapters[0]
  const actIndex = chapter?.acts.findIndex((a) => a.id === actId) ?? 0

  // ── Sort state ─────────────────────────────────────────────────────────
  const [sortMode, setSortMode] = useState<SortMode>("default")
  const [customOrder, setCustomOrder] = useState<string[] | null>(null)
  const [aiState, setAiState] = useState<AiSortState>({ loading: false, result: null, error: null })
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string>("")
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Drag-and-drop state
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const activeModels = useMemo(() => models.filter((m) => m.active), [models])

  // Reset on open/close
  useEffect(() => {
    if (open) {
      if (initialPromptOrder && initialPromptOrder.length > 0) {
        setSortMode("custom")
        setCustomOrder(initialPromptOrder)
      } else {
        setSortMode("default")
        setCustomOrder(null)
      }
      setAiState({ loading: false, result: null, error: null })
      setShowModelPicker(false)
      setSelectedModelId(activeModels[0]?.id ?? "")
    } else {
      // Small delay so animation finishes before reset
      const t = setTimeout(() => {
        setSortMode("default")
        setCustomOrder(null)
        setAiState({ loading: false, result: null, error: null })
        setDraggedId(null)
        setDragOverId(null)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  // ── Filtered entries ───────────────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    const allEntries = novelId
      ? getPromptEntriesForNovel(novelId)
      : promptEntries.filter((e) => e.scope === "global")
    if (mode === "test" && testEntryId) {
      const te = promptEntries.find((e) => e.id === testEntryId)
      return te ? [te] : []
    }
    if (activeEntryIds) {
      return allEntries.filter((e) => activeEntryIds.includes(e.id))
    }
    return allEntries.filter((e) => e.active)
  }, [novelId, promptEntries, getPromptEntriesForNovel, activeEntryIds, testEntryId, mode])

  // ── Sorted entries (based on current sort mode) ────────────────────────
  const sortedEntries = useMemo((): PromptEntry[] => {
    if (sortMode === "custom" && customOrder && customOrder.length > 0) {
      const map = new Map(filteredEntries.map((e) => [e.id, e]))
      const ordered = customOrder.map((id) => map.get(id)).filter(Boolean) as PromptEntry[]
      const rest = filteredEntries.filter((e) => !customOrder.includes(e.id))
      return [...ordered, ...rest]
    }
    return sortPromptEntries(filteredEntries)
  }, [sortMode, customOrder, filteredEntries])

  const enc = useMemo(
    () => (novelId ? entries.filter((e) => e.novelId === novelId) : []),
    [novelId, entries],
  )

  const testEntry = useMemo(
    () => (testEntryId ? promptEntries.find((e) => e.id === testEntryId) ?? null : null),
    [testEntryId, promptEntries],
  )

  // ── Blocks (for default/custom view and copy) ──────────────────────────
  const { blocks, fullText, tokenEstimate } = useMemo(() => {
    return buildPromptPreviewBlocks({
      mode,
      novel,
      chapter,
      actIndex,
      entries: sortedEntries,
      encyclopediaEntries: enc,
      chapterCount,
      actsPerChapter,
      testEntry,
      entriesPreFiltered: true,
    })
  }, [mode, novel, chapter, actIndex, sortedEntries, enc, chapterCount, actsPerChapter, testEntry])

  const entryBlockIds = useMemo(
    () => new Set(sortedEntries.map((e) => e.id)),
    [sortedEntries],
  )

  // ── AI-ordered entries (for AI result display) ─────────────────────────
  const aiOrderedEntries = useMemo(() => {
    if (!aiState.result) return []
    const map = new Map(filteredEntries.map((e) => [e.id, e]))
    const ordered = aiState.result.order.map((id) => map.get(id)).filter(Boolean) as PromptEntry[]
    const rest = filteredEntries.filter((e) => !aiState.result!.order.includes(e.id))
    return [...ordered, ...rest]
  }, [aiState.result, filteredEntries])

  // ── Full text for copy (AI view uses AI order) ─────────────────────────
  const copyText = useMemo(() => {
    if (sortMode === "ai" && aiState.result) {
      const { fullText: aiFullText } = buildPromptPreviewBlocks({
        mode,
        novel,
        chapter,
        actIndex,
        entries: aiOrderedEntries,
        encyclopediaEntries: enc,
        chapterCount,
        actsPerChapter,
        testEntry,
        entriesPreFiltered: true,
      })
      return aiFullText
    }
    return fullText
  }, [sortMode, aiState.result, aiOrderedEntries, fullText, mode, novel, chapter, actIndex, enc, chapterCount, actsPerChapter, testEntry])

  function copyAll() {
    void navigator.clipboard.writeText(copyText)
    showToast("已复制到剪贴板")
  }

  // ── Drag-and-drop ──────────────────────────────────────────────────────
  function handleDragStart(id: string) {
    setDraggedId(id)
  }
  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (id !== draggedId) setDragOverId(id)
  }
  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }
    const currentIds = sortedEntries.map((e) => e.id)
    const fromIdx = currentIds.indexOf(draggedId)
    const toIdx = currentIds.indexOf(targetId)
    if (fromIdx < 0 || toIdx < 0) return
    const newOrder = [...currentIds]
    newOrder.splice(fromIdx, 1)
    newOrder.splice(toIdx, 0, draggedId)
    setCustomOrder(newOrder)
    setSortMode("custom")
    setDraggedId(null)
    setDragOverId(null)
  }
  function handleDragEnd() {
    setDraggedId(null)
    setDragOverId(null)
  }

  // ── AI sort ────────────────────────────────────────────────────────────
  async function runAiSort() {
    const model = activeModels.find((m) => m.id === selectedModelId) ?? activeModels[0]
    if (!model || filteredEntries.length === 0) return

    setShowModelPicker(false)
    setAiState({ loading: true, result: null, error: null })
    setSortMode("ai")

    try {
      const result = await recommendOrder({ entries: filteredEntries, mode, model })
      setAiState({ loading: false, result, error: null })
    } catch (err) {
      setAiState({
        loading: false,
        result: null,
        error: err instanceof Error ? err.message : "请求失败",
      })
      setSortMode("default")
    }
  }

  function applyAiOrder() {
    if (!aiState.result) return
    setCustomOrder(aiState.result.order)
    setSortMode("custom")
    onApplyOrder?.(aiState.result.order)
    showToast("已应用 AI 推荐排序，可继续手动调整")
  }

  function resetToDefault() {
    setSortMode("default")
    setCustomOrder(null)
    setAiState({ loading: false, result: null, error: null })
  }

  // ── Render ─────────────────────────────────────────────────────────────
  const showDragHint = sortMode === "custom"

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-[480px] max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[480px]"
      >
        {/* Toast */}
        {toast && (
          <div className="absolute bottom-20 left-5 right-5 z-50 rounded-lg bg-primary px-4 py-2.5 text-xs text-primary-foreground shadow-lg transition-all duration-200">
            {toast}
          </div>
        )}

        {/* Header */}
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-base">完整提示词预览</SheetTitle>
            <Button size="sm" variant="outline" onClick={copyAll}>
              <Copy className="size-3.5" />
              复制全文
            </Button>
          </div>

          {/* Sort controls */}
          {filteredEntries.length > 0 && mode !== "test" && (
            <div className="mt-3 flex items-center gap-2">
              <span className="shrink-0 text-xs text-muted-foreground">排序方式</span>
              <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1">
                <SortButton
                  active={sortMode === "default" || (sortMode === "ai" && !aiState.result && !aiState.loading)}
                  onClick={resetToDefault}
                  disabled={aiState.loading}
                >
                  默认排序
                </SortButton>
                <SortButton
                  active={sortMode === "custom"}
                  onClick={() => {
                    setSortMode("custom")
                    if (!customOrder) setCustomOrder(sortedEntries.map((e) => e.id))
                    setAiState((s) => ({ ...s, result: null }))
                  }}
                  disabled={aiState.loading}
                >
                  自定义排序
                </SortButton>
              </div>

              {/* AI sort button + model picker */}
              <div className="relative">
                <Button
                  size="sm"
                  variant={sortMode === "ai" ? "default" : "outline"}
                  className="gap-1.5 text-xs"
                  disabled={aiState.loading}
                  onClick={() => setShowModelPicker((v) => !v)}
                >
                  {aiState.loading ? (
                    <RefreshCw className="size-3 animate-spin" />
                  ) : (
                    <Sparkles className="size-3" />
                  )}
                  AI 推荐排序
                </Button>

                {/* Model picker popover */}
                {showModelPicker && (
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-border bg-popover p-3 shadow-lg">
                    <p className="mb-2 text-xs font-medium">使用哪个模型来推荐排序？</p>
                    <Select
                      value={selectedModelId || activeModels[0]?.id || ""}
                      onValueChange={(v) => v && setSelectedModelId(v)}
                    >
                      <SelectTrigger size="sm" className="w-full text-xs">
                        <SelectValue>
                          {() =>
                            activeModels.find((m) => m.id === selectedModelId)?.label ??
                            activeModels[0]?.label ??
                            "选择模型"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {activeModels.map((m) => (
                            <SelectItem key={m.id} value={m.id} className="text-xs">
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <div className="mt-2 flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setShowModelPicker(false)}
                      >
                        取消
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={runAiSort}
                        disabled={activeModels.length === 0}
                      >
                        开始分析
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Drag hint */}
          {showDragHint && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              拖动调整顺序，仅影响本次生成
            </p>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-3 px-5 py-4">
            {/* ── AI Loading skeleton ─────────────────────────────────── */}
            {aiState.loading && (
              <>
                <div className="flex items-center gap-2 py-2">
                  <RefreshCw className="size-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">正在分析最优排序……</span>
                </div>
                {[...Array(filteredEntries.length)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg border border-border bg-muted/40"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </>
            )}

            {/* ── AI Result view ─────────────────────────────────────── */}
            {sortMode === "ai" && !aiState.loading && aiState.result && (
              <>
                {/* Summary card */}
                <div className="rounded-lg border border-indigo-500/30 border-l-4 border-l-indigo-500/60 bg-indigo-500/5 p-3 backdrop-blur-sm">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-indigo-400" />
                    <span className="text-xs font-medium text-indigo-400">AI 推荐排序</span>
                    <span className="text-[10px] text-muted-foreground">
                      · 由 {activeModels.find((m) => m.id === selectedModelId)?.label ?? "AI"} 分析
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{aiState.result.summary}</p>
                  <div className="mt-2.5 flex gap-2">
                    <Button size="sm" className="h-7 text-xs" onClick={applyAiOrder}>
                      应用此顺序
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={resetToDefault}>
                      恢复默认
                    </Button>
                  </div>
                </div>

                {/* Recommended order rows */}
                {aiOrderedEntries.map((entry, idx) => {
                  const reason = aiState.result!.reasons[entry.id]
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-3 transition-all duration-200"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400 tabular-nums">
                        {idx + 1}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn("text-[9px]", PROMPT_GROUP_BADGE_CLASS[entry.group])}
                          >
                            {GROUP_EMOJI[entry.group]} {PROMPT_GROUP_LABELS[entry.group]}
                          </Badge>
                          <span className="text-xs font-medium">{entry.name}</span>
                        </div>
                        {reason && (
                          <p className="truncate text-[11px] italic text-muted-foreground">
                            {reason}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* ── AI Error ────────────────────────────────────────────── */}
            {sortMode === "ai" && !aiState.loading && aiState.error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs text-destructive">{aiState.error}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 h-7 text-xs"
                  onClick={resetToDefault}
                >
                  恢复默认
                </Button>
              </div>
            )}

            {/* ── Empty entries notice (non-test mode only) ───────────── */}
            {!aiState.loading && mode !== "test" && filteredEntries.length === 0 && (
              <div className="mx-1 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-center">
                <p className="text-xs font-medium text-muted-foreground">当前没有启用的词条</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  提示词将仅包含系统提示与背景信息，不含任何自定义规则
                </p>
              </div>
            )}

            {/* ── Default / Custom blocks view ────────────────────────── */}
            {!aiState.loading && (sortMode !== "ai" || (!aiState.result && !aiState.error)) &&
              blocks.map((block) => {
                const isEntry = entryBlockIds.has(block.id)
                const entryPos = isEntry
                  ? sortedEntries.findIndex((e) => e.id === block.id) + 1
                  : null
                const isDragging = draggedId === block.id
                const isDragOver = dragOverId === block.id && draggedId !== block.id

                return (
                  <div
                    key={block.id}
                    draggable={isEntry && sortMode === "custom"}
                    onDragStart={() => isEntry && handleDragStart(block.id)}
                    onDragOver={(e) => isEntry && handleDragOver(e, block.id)}
                    onDrop={() => isEntry && handleDrop(block.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "group relative rounded-lg border border-border/60 bg-card/40 p-3 backdrop-blur-sm border-l-4 transition-all duration-200",
                      block.borderClass,
                      isEntry && sortMode === "custom" && "cursor-grab pl-8 active:cursor-grabbing",
                      isDragging && "scale-95 opacity-50 border-dashed",
                      isDragOver && "border-t-2 border-t-indigo-500",
                    )}
                  >
                    {/* Drag handle */}
                    {isEntry && sortMode === "custom" && (
                      <GripVertical className="absolute left-2 top-3.5 size-3.5 text-muted-foreground/50 transition-opacity group-hover:text-muted-foreground" />
                    )}

                    {/* Position badge (default sort) */}
                    {isEntry && sortMode === "default" && entryPos !== null && (
                      <span className="absolute right-3 top-3 text-[10px] tabular-nums text-muted-foreground/60">
                        #{entryPos}
                      </span>
                    )}

                    {/* Position badge (custom sort) */}
                    {isEntry && sortMode === "custom" && entryPos !== null && (
                      <span className="absolute right-3 top-3 flex size-4 items-center justify-center rounded-full bg-muted text-[9px] tabular-nums text-muted-foreground">
                        {entryPos}
                      </span>
                    )}

                    <Badge
                      variant="outline"
                      className={cn("mb-2 text-[10px]", block.badgeClass)}
                    >
                      {block.badge}
                    </Badge>
                    <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
                      {block.content}
                    </pre>
                  </div>
                )
              })}
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

// ── Small sort button ──────────────────────────────────────────────────────

function SortButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {children}
    </button>
  )
}
