"use client"

import { useMemo, useState } from "react"
import { Plus, Search, BookText } from "lucide-react"
import { PromptEntryDialog } from "@/components/prompts/prompt-entry-dialog"
import { PromptEntryCard } from "@/components/prompts/prompt-entry-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useStore } from "@/lib/store"
import {
  type PromptEntry,
  type PromptGroup,
  PROMPT_GROUP_LABELS,
  buildPromptPreview,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const GROUP_TABS = [
  { key: "全部", group: null },
  { key: "风格", group: "style" as PromptGroup },
  { key: "禁止", group: "forbidden" as PromptGroup },
  { key: "格式", group: "format" as PromptGroup },
  { key: "人物", group: "character" as PromptGroup },
  { key: "场景", group: "scene" as PromptGroup },
  { key: "自定义", group: "custom" as PromptGroup },
] as const

type ScopeFilter = "全部" | "全局" | "小说级"

type Props = {
  /** When set, show global + novel entries for this novel */
  novelId?: string
  /** Global library page: only global entries */
  globalOnly?: boolean
  /** Hide create button */
  readOnly?: boolean
  /** Override active toggle (outline gen) */
  overrideStates?: Record<string, boolean>
  onOverrideChange?: (entryId: string, active: boolean) => void
}

export function PromptsPanel({
  novelId,
  globalOnly = false,
  readOnly = false,
  overrideStates,
  onOverrideChange,
}: Props) {
  const {
    promptEntries,
    novels,
    addPromptEntry,
    updatePromptEntry,
    deletePromptEntry,
    getPromptEntriesForNovel,
  } = useStore()

  const [query, setQuery] = useState("")
  const [groupFilter, setGroupFilter] = useState("全部")
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(globalOnly ? "全局" : "全部")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PromptEntry | null>(null)
  const [previewEntry, setPreviewEntry] = useState<PromptEntry | null>(null)
  const [testText, setTestText] = useState("林墨握紧古剑，站在裂谷之中。")

  const baseEntries = useMemo(() => {
    if (globalOnly) return promptEntries.filter((e) => e.scope === "global")
    if (novelId) return getPromptEntriesForNovel(novelId)
    return promptEntries
  }, [globalOnly, novelId, promptEntries, getPromptEntriesForNovel])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const groupDef = GROUP_TABS.find((g) => g.key === groupFilter)
    return baseEntries.filter((e) => {
      const matchGroup = !groupDef?.group || e.group === groupDef.group
      const matchScope =
        scopeFilter === "全部" ||
        (scopeFilter === "全局" && e.scope === "global") ||
        (scopeFilter === "小说级" && e.scope === "novel")
      const matchQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q)
      return matchGroup && matchScope && matchQuery
    })
  }, [baseEntries, query, groupFilter, scopeFilter])

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(entry: PromptEntry) {
    setEditing(entry)
    setDialogOpen(true)
  }

  function save(entry: PromptEntry) {
    const exists = promptEntries.some((e) => e.id === entry.id)
    if (exists) updatePromptEntry(entry.id, entry)
    else addPromptEntry(entry)
  }

  function getNovelTitle(id?: string) {
    return novels.find((n) => n.id === id)?.title
  }

  return (
    <div className="flex flex-col gap-6">
      {!readOnly && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索名称或内容……"
              className="pl-9"
            />
          </div>
          <Button onClick={openAdd}>
            <Plus data-icon="inline-start" />
            新建词条
          </Button>
        </div>
      )}

      {readOnly && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索……"
            className="pl-9 h-8 text-sm"
          />
        </div>
      )}

      <Tabs value={groupFilter} onValueChange={setGroupFilter}>
        <TabsList className="h-auto flex-wrap">
          {GROUP_TABS.map((g) => (
            <TabsTrigger key={g.key} value={g.key} className="text-xs">
              {g.key}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {!globalOnly && (
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1 w-fit">
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

      {filtered.length === 0 ? (
        <Empty className="rounded-xl border border-dashed border-border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookText />
            </EmptyMedia>
            <EmptyTitle>没有匹配的词条</EmptyTitle>
            <EmptyDescription>调整筛选条件，或新建一个提示词词条。</EmptyDescription>
          </EmptyHeader>
          {!readOnly && (
            <Button onClick={openAdd}>
              <Plus data-icon="inline-start" />
              新建词条
            </Button>
          )}
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => {
            const hasOverride = overrideStates && entry.id in overrideStates
            const effectiveActive = hasOverride
              ? overrideStates[entry.id]
              : entry.active
            return (
              <PromptEntryCard
                key={entry.id}
                entry={entry}
                novelTitle={getNovelTitle(entry.novelId)}
                showInherited={!!novelId && entry.scope === "global"}
                effectiveActive={effectiveActive}
                readOnly={readOnly && !onOverrideChange}
                onEdit={() => openEdit(entry)}
                onDelete={() => deletePromptEntry(entry.id)}
                onToggleActive={(active) => updatePromptEntry(entry.id, { active })}
                onToggleEffective={
                  onOverrideChange
                    ? (active) => onOverrideChange(entry.id, active)
                    : undefined
                }
                onPreview={() => {
                  setPreviewEntry(entry)
                  setTestText("林墨握紧古剑，站在裂谷之中。")
                }}
              />
            )
          })}
        </div>
      )}

      {!readOnly && (
        <PromptEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          defaultScope={novelId ? "novel" : "global"}
          defaultNovelId={novelId}
          lockScope={!!novelId && !editing}
          onSave={save}
        />
      )}

      <Dialog open={!!previewEntry} onOpenChange={(o) => !o && setPreviewEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>测试预览 · {previewEntry?.name}</DialogTitle>
            <DialogDescription>模拟启用该词条后 AI 会收到的 Prompt 片段</DialogDescription>
          </DialogHeader>
          {previewEntry && (
            <FieldGroup>
              <Field>
                <FieldLabel>测试文本</FieldLabel>
                <Textarea rows={3} value={testText} onChange={(e) => setTestText(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Prompt 片段</FieldLabel>
                <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {buildPromptPreview(previewEntry)}
                  {"\n\n---\n\n"}
                  {testText || "（测试文本）"}
                </div>
              </Field>
            </FieldGroup>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewEntry(null)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
