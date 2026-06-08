"use client"

import { useMemo, useState } from "react"
import { Plus, Search, Pencil, Trash2, BookText } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { EntryDialog } from "@/components/entry-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { useStore } from "@/lib/store"
import type { Entry } from "@/lib/types"

const FILTERS = ["全部", "角色", "地名", "物品", "功法"] as const
type Filter = (typeof FILTERS)[number]

const CATEGORY_COLOR_MAP: Record<string, string> = {
  角色: "bg-primary/15 text-primary",
  地名: "bg-chart-2/15 text-chart-2",
  物品: "bg-chart-4/15 text-chart-4",
  功法: "bg-chart-3/15 text-chart-3",
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLOR_MAP[category] ?? "bg-muted/50 text-muted-foreground"
}

export default function EncyclopediaPage() {
  const { entries, setEntries } = useStore()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("全部")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Entry | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      const matchCat = filter === "全部" || e.category === filter
      const matchQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q))
      return matchCat && matchQuery
    })
  }, [entries, query, filter])

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(entry: Entry) {
    setEditing(entry)
    setDialogOpen(true)
  }

  function save(entry: Entry) {
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === entry.id)
      return exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...prev]
    })
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="世界观词条" />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索标题、内容或关键词……"
              className="pl-9"
            />
          </div>
          <Button onClick={openAdd}>
            <Plus data-icon="inline-start" />
            新建词条
          </Button>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f}>
                {f}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

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
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => openEdit(entry)}
                onDelete={() => remove(entry.id)}
              />
            ))}
          </div>
        )}
      </main>

      <EntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={save}
      />
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
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${getCategoryColor(entry.category)}`}
            >
              {entry.category}
            </span>
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
      <CardFooter className="justify-end gap-1 border-t border-border pt-3 opacity-0 transition-opacity group-hover:opacity-100">
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
      </CardFooter>
    </Card>
  )
}
