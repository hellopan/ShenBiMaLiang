"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { X, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { type Entry } from "@/lib/types"
import { uid, useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const PREDEFINED_CATEGORIES = ["角色", "地名", "物品", "功法"]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: Entry | null
  onSave: (entry: Entry) => void
}

const empty = (): Entry => ({
  id: uid(),
  title: "",
  category: "角色",
  content: "",
  keywords: [],
  regexPatterns: "",
  weight: 5,
  active: true,
})

// ── Combobox for category selection ──────────────────────────────────────────
function CategoryCombobox({
  value,
  onChange,
  categories,
}: {
  value: string
  onChange: (v: string) => void
  categories: string[]
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInput(value)
  }, [value])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filtered = categories.filter((c) =>
    c.toLowerCase().includes(input.toLowerCase()),
  )
  const trimmed = input.trim()
  const showNew = trimmed !== "" && !categories.some((c) => c === trimmed)

  function select(val: string) {
    onChange(val)
    setInput(val)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="选择或输入分类"
      />
      {open && (filtered.length > 0 || showNew) && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "flex w-full items-center px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                c === value && "bg-accent/60 font-medium",
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                select(c)
              }}
            >
              {c}
            </button>
          ))}
          {showNew && (
            <button
              type="button"
              className="flex w-full items-center gap-1.5 border-t border-border px-3 py-1.5 text-sm text-primary transition-colors hover:bg-accent"
              onMouseDown={(e) => {
                e.preventDefault()
                select(trimmed)
              }}
            >
              <Plus className="size-3 shrink-0" />
              新建分类：{trimmed}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main dialog ───────────────────────────────────────────────────────────────
export function EntryDialog({ open, onOpenChange, initial, onSave }: Props) {
  const { entries } = useStore()
  const [draft, setDraft] = useState<Entry>(empty())
  const [keywordInput, setKeywordInput] = useState("")

  const availableCategories = useMemo(() => {
    const cats = new Set<string>(PREDEFINED_CATEGORIES)
    entries.forEach((e) => cats.add(e.category))
    return [...cats]
  }, [entries])

  useEffect(() => {
    if (open) {
      setDraft(initial ? { ...initial } : empty())
      setKeywordInput("")
    }
  }, [open, initial])

  function set<K extends keyof Entry>(key: K, value: Entry[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function addKeyword() {
    const kw = keywordInput.trim()
    if (kw && !draft.keywords.includes(kw)) {
      set("keywords", [...draft.keywords, kw])
    }
    setKeywordInput("")
  }

  function onKeywordKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addKeyword()
    } else if (e.key === "Backspace" && !keywordInput && draft.keywords.length) {
      set("keywords", draft.keywords.slice(0, -1))
    }
  }

  function submit() {
    onSave(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-200 max-w-[90vw] max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "编辑词条" : "新建词条"}</DialogTitle>
          <DialogDescription>
            词条会在 AI 生成时作为世界观背景注入，权重越高越优先。
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="e-title">标题</FieldLabel>
            <Input
              id="e-title"
              placeholder="例如：林墨 / 青云宗"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="e-cat">分类</FieldLabel>
            <CategoryCombobox
              value={draft.category}
              onChange={(v) => set("category", v)}
              categories={availableCategories}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="e-content">内容</FieldLabel>
            <Textarea
              id="e-content"
              rows={4}
              placeholder="详细描述这个词条……"
              value={draft.content}
              onChange={(e) => set("content", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="e-kw">关键词</FieldLabel>
            <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-input/30 px-2 py-1.5">
              {draft.keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="gap-1">
                  {kw}
                  <button
                    type="button"
                    onClick={() => set("keywords", draft.keywords.filter((k) => k !== kw))}
                    aria-label={`移除 ${kw}`}
                    className="transition-colors hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              <input
                id="e-kw"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={onKeywordKey}
                onBlur={addKeyword}
                placeholder={draft.keywords.length ? "" : "输入后回车添加"}
                className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <FieldDescription>回车或逗号添加，用于触发词条匹配。</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="e-regex">正则匹配</FieldLabel>
            <Textarea
              id="e-regex"
              rows={2}
              placeholder="例如：林墨|墨儿"
              value={draft.regexPatterns}
              onChange={(e) => set("regexPatterns", e.target.value)}
              className="font-mono text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>
              权重
              <span className="ml-auto text-sm tabular-nums text-primary">{draft.weight}</span>
            </FieldLabel>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[draft.weight]}
              onValueChange={(v) => set("weight", Array.isArray(v) ? v[0] : v)}
            />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="e-active">启用词条</FieldLabel>
            <Switch
              id="e-active"
              checked={draft.active}
              onCheckedChange={(v) => set("active", v)}
              className="ml-auto"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit} disabled={!draft.title.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
