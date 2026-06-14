"use client"

import { useEffect, useState } from "react"
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
import { TagInput } from "@/components/ui/tag-input"
import { PresetTagPicker } from "@/components/preset-tag-picker"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { ENTRY_CATEGORIES } from "@/lib/entry-categories"
import { type Entry } from "@/lib/types"
import { uid } from "@/lib/store"

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

export function EntryDialog({ open, onOpenChange, initial, onSave }: Props) {
  const [draft, setDraft] = useState<Entry>(empty())

  useEffect(() => {
    if (open) {
      setDraft(initial ? { ...initial } : empty())
    }
  }, [open, initial])

  function set<K extends keyof Entry>(key: K, value: Entry[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
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
            <PresetTagPicker
              id="e-cat"
              presets={ENTRY_CATEGORIES}
              value={draft.category ? [draft.category] : []}
              onChange={(tags) => set("category", tags[0] ?? "角色")}
              single
              placeholder="选择或输入分类"
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
            <TagInput
              id="e-kw"
              tags={draft.keywords}
              onChange={(keywords) => set("keywords", keywords)}
              description="回车或逗号添加，用于触发词条匹配。"
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
