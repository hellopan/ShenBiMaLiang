"use client"

import { forwardRef, useImperativeHandle, useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { PromptEntryDialog } from "@/components/prompts/prompt-entry-dialog"
import { PromptEntryCard } from "@/components/prompts/prompt-entry-card"
import { PromptPreviewSheet } from "@/components/prompts/prompt-preview-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { BookMarked } from "lucide-react"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { PromptEntry, PromptGroup } from "@/lib/types"
import {
  PROMPT_GROUP_LABELS,
  PROMPT_GROUP_BADGE_CLASS,
  PROMPT_SCOPE_BADGE_CLASS,
} from "@/lib/types"
import { cn, sortPromptEntries } from "@/lib/utils"

const GROUP_MAP: Record<string, PromptGroup | null> = {
  全部: null,
  风格: "style",
  禁止: "forbidden",
  格式: "format",
  人物: "character",
  场景: "scene",
  自定义: "custom",
}

type ScopeFilter = "全部" | "全局" | "小说级"

export type PromptEntriesPanelProps = {
  novelId?: string
  showScopeFilter?: boolean
  hideAddButton?: boolean
  /** read-only list with local override toggles (outline gen) */
  overrideMode?: boolean
  overrideStates?: Record<string, boolean>
  onOverrideChange?: (entryId: string, active: boolean) => void
}

export type PromptEntriesPanelHandle = {
  openAdd: () => void
}

export const PromptEntriesPanel = forwardRef<PromptEntriesPanelHandle, PromptEntriesPanelProps>(
function PromptEntriesPanel(
  {
    novelId,
    showScopeFilter = true,
    hideAddButton = false,
    overrideMode = false,
    overrideStates,
    onOverrideChange,
  },
  ref,
) {
  const {
    promptEntries,
    novels,
    addPromptEntry,
    updatePromptEntry,
    deletePromptEntry,
    getPromptEntriesForNovel,
  } = useStore()

  const [query, setQuery] = useState("")
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(
    novelId ? "全部" : "全局",
  )
  const [groupFilter, setGroupFilter] = useState("全部")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PromptEntry | null>(null)
  const [previewEntryId, setPreviewEntryId] = useState<string | null>(null)

  const baseEntries = useMemo(() => {
    if (novelId) return getPromptEntriesForNovel(novelId)
    return promptEntries
  }, [novelId, promptEntries, getPromptEntriesForNovel])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const group = GROUP_MAP[groupFilter]
    const result = baseEntries.filter((e) => {
      const matchScope =
        !showScopeFilter ||
        scopeFilter === "全部" ||
        (scopeFilter === "全局" && e.scope === "global") ||
        (scopeFilter === "小说级" && e.scope === "novel")
      const matchGroup = !group || e.group === group
      const matchQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q)
      return matchScope && matchGroup && matchQuery
    })
    // In override mode, use canonical group order for stable display
    return overrideMode ? sortPromptEntries(result) : result
  }, [baseEntries, query, scopeFilter, groupFilter, showScopeFilter, overrideMode])

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  useImperativeHandle(ref, () => ({ openAdd }), [])

  function openEdit(entry: PromptEntry) {
    setEditing(entry)
    setDialogOpen(true)
  }

  function save(entry: Omit<PromptEntry, "id" | "createdAt"> & { id?: string }) {
    if (entry.id && promptEntries.some((e) => e.id === entry.id)) {
      const { id, ...rest } = entry as PromptEntry
      updatePromptEntry(id, rest)
    } else {
      addPromptEntry(entry)
    }
  }

  function getNovelTitle(id?: string) {
    return novels.find((n) => n.id === id)?.title
  }

  const readOnly = overrideMode

  return (
    <div className="flex flex-col gap-4">
      {!readOnly && !hideAddButton && (
        <div className="flex justify-end">
          <Button onClick={openAdd}>
            <Plus data-icon="inline-start" />
            新建词条
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {showScopeFilter && (
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1">
            {(["全部", "全局", "小说级"] as ScopeFilter[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScopeFilter(s)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-all",
                  scopeFilter === s
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-1 flex-wrap items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1">
          {Object.keys(GROUP_MAP).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroupFilter(g)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                groupFilter === g
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索名称或内容…"
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty className="rounded-xl border border-dashed border-border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookMarked />
            </EmptyMedia>
            <EmptyTitle>没有匹配的词条</EmptyTitle>
            <EmptyDescription>调整筛选条件，或新建提示词词条。</EmptyDescription>
          </EmptyHeader>
            {!readOnly && (
              <Button onClick={openAdd}>
                <Plus data-icon="inline-start" />
                新建词条
              </Button>
            )}
          </Empty>
        ) : readOnly ? (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/40 p-3">
            {filtered.map((entry) => {
              const active =
                entry.id in (overrideStates ?? {})
                  ? overrideStates![entry.id]
                  : entry.active
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-md border border-border/50 bg-background/40 px-3 py-2"
                >
                  <Switch
                    checked={active}
                    onCheckedChange={(v) => onOverrideChange?.(entry.id, v)}
                    aria-label={`启用 ${entry.name}`}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{entry.name}</span>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", PROMPT_SCOPE_BADGE_CLASS[entry.scope])}
                  >
                    {entry.scope === "global" ? "全局" : "小说级"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", PROMPT_GROUP_BADGE_CLASS[entry.group])}
                  >
                    {PROMPT_GROUP_LABELS[entry.group]}
                  </Badge>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((entry) => (
              <PromptEntryCard
                key={entry.id}
                entry={entry}
                novelTitle={getNovelTitle(entry.novelId)}
                onEdit={() => openEdit(entry)}
                onDelete={() => deletePromptEntry(entry.id)}
                onToggleActive={(active) => updatePromptEntry(entry.id, { active })}
                onPreview={() => setPreviewEntryId(entry.id)}
                readOnly={entry.isSystem}
              />
            ))}
          </div>
        )}

      {!readOnly && (
        <PromptEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          defaultScope={novelId ? "novel" : "global"}
          defaultNovelId={novelId}
          lockNovelScope={!!novelId && !editing}
          onSave={save}
          onPreview={(entry) => setPreviewEntryId(entry.id)}
        />
      )}

      <PromptPreviewSheet
        open={!!previewEntryId}
        onClose={() => setPreviewEntryId(null)}
        novelId={novelId}
        mode="test"
        testEntryId={previewEntryId ?? undefined}
      />
    </div>
  )
})
