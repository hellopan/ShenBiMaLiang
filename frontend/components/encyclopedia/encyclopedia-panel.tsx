"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, Pencil, Trash2, BookText, LayoutGrid, List } from "lucide-react"
import { toast } from "sonner"
import { EntryDialog } from "@/components/entry-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { buildEntryFilters } from "@/lib/entry-categories"
import { useStore } from "@/lib/store"
import type { Entry } from "@/lib/types"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"
const VIEW_MODE_KEY = "encyclopedia-view-mode"

const CATEGORY_COLOR_MAP: Record<string, string> = {
  角色: "bg-primary/15 text-primary",
  地点: "bg-chart-2/15 text-chart-2",
  物品: "bg-chart-4/15 text-chart-4",
  组织: "bg-chart-3/15 text-chart-3",
  力量体系: "bg-chart-5/15 text-chart-5",
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLOR_MAP[category] ?? "bg-muted/50 text-muted-foreground"
}

type Props = {
  novelId: string
}

export function EncyclopediaPanel({ novelId }: Props) {
  const { entries, addEntry, updateEntry, deleteEntry } = useStore()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("全部")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    if (stored === "grid" || stored === "list") {
      setViewMode(stored)
    }
  }, [])

  function setViewModeAndPersist(mode: ViewMode) {
    setViewMode(mode)
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }

  const filters = useMemo(
    () => buildEntryFilters(entries, novelId),
    [entries, novelId],
  )

  useEffect(() => {
    if (filter !== "全部" && !filters.includes(filter)) {
      setFilter("全部")
    }
  }, [filter, filters])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      const matchNovel = e.novelId === novelId
      const matchCat = filter === "全部" || e.category === filter
      const matchQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q))
      return matchNovel && matchCat && matchQuery
    })
  }, [entries, query, filter, novelId])

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(entry: Entry) {
    setEditing(entry)
    setDialogOpen(true)
  }

  function save(entry: Entry) {
    const entryWithNovel: Entry = { ...entry, novelId }
    const exists = entries.some((e) => e.id === entryWithNovel.id)
    if (exists) {
      updateEntry(entryWithNovel.id, entryWithNovel)
      toast.success(`词条「${entryWithNovel.title}」已更新`)
    } else {
      addEntry(entryWithNovel)
      toast.success(`词条「${entryWithNovel.title}」已创建`)
    }
  }

  const pendingEntry = entries.find((e) => e.id === pendingDeleteId)

  function confirmDelete() {
    if (!pendingDeleteId) return
    deleteEntry(pendingDeleteId)
    toast.success(`词条「${pendingEntry?.title ?? ""}」已删除`)
    setPendingDeleteId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            aria-label="卡片视图"
            onClick={() => setViewModeAndPersist("grid")}
            className={cn(
              "rounded-md p-1.5 transition-all",
              viewMode === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            aria-label="列表视图"
            onClick={() => setViewModeAndPersist("list")}
            className={cn(
              "rounded-md p-1.5 transition-all",
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-4" />
          </button>
        </div>
        <Button onClick={openAdd}>
          <Plus data-icon="inline-start" />
          新建词条
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
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
              <BookText />
            </EmptyMedia>
            <EmptyTitle>没有匹配的词条</EmptyTitle>
            <EmptyDescription>调整筛选条件，或新建一个词条。</EmptyDescription>
          </EmptyHeader>
          <Button onClick={openAdd}>
            <Plus data-icon="inline-start" />
            新建词条
          </Button>
        </Empty>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => openEdit(entry)}
              onDelete={() => setPendingDeleteId(entry.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((entry) => (
            <EntryListRow
              key={entry.id}
              entry={entry}
              onEdit={() => openEdit(entry)}
              onDelete={() => setPendingDeleteId(entry.id)}
            />
          ))}
        </div>
      )}

      <EntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={save}
      />

      <ConfirmDialog
        open={!!pendingDeleteId}
        onOpenChange={(o) => !o && setPendingDeleteId(null)}
        title="删除词条"
        description={
          pendingEntry
            ? `确定要删除词条「${pendingEntry.title}」吗？此操作不可撤销。`
            : undefined
        }
        confirmLabel="删除"
        onConfirm={confirmDelete}
      />
    </div>
  )
}

function EntryCategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${getCategoryColor(category)}`}
    >
      {category}
    </span>
  )
}

function EntryActions({
  onEdit,
  onDelete,
  alwaysVisible = false,
}: {
  onEdit: () => void
  onDelete: () => void
  alwaysVisible?: boolean
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1",
        !alwaysVisible && "opacity-0 transition-opacity group-hover:opacity-100",
      )}
    >
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onEdit}
        aria-label="编辑"
        className="text-muted-foreground hover:text-foreground"
      >
        <Pencil />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onDelete}
        aria-label="删除"
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 />
      </Button>
    </div>
  )
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: Entry
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card className="group flex flex-col gap-0">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <EntryCategoryBadge category={entry.category} />
            <span className={entry.active ? "" : "text-muted-foreground line-through"}>
              {entry.title}
            </span>
          </CardTitle>
          <Badge variant="outline" className="shrink-0 tabular-nums">
            权重 {entry.weight}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {entry.content}
        </p>
        {entry.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entry.keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="font-normal">
                {kw}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-1 border-t border-border pt-3">
        <EntryActions onEdit={onEdit} onDelete={onDelete} />
      </CardFooter>
    </Card>
  )
}

function EntryListRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: Entry
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <EntryCategoryBadge category={entry.category} />
          <span
            className={cn(
              "truncate text-sm font-semibold",
              entry.active ? "" : "text-muted-foreground line-through",
            )}
          >
            {entry.title}
          </span>
          <Badge variant="outline" className="ml-auto shrink-0 tabular-nums">
            权重 {entry.weight}
          </Badge>
        </div>
        {entry.content && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{entry.content}</p>
        )}
        {entry.keywords.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="font-normal">
                {kw}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <EntryActions onEdit={onEdit} onDelete={onDelete} alwaysVisible />
    </div>
  )
}
