"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PromptEntry, PromptGroup, PromptScope } from "@/lib/types"
import { PROMPT_GROUP_LABELS } from "@/lib/types"
import { useStore } from "@/lib/store"

const GROUPS: PromptGroup[] = ["style", "forbidden", "format", "character", "scene", "custom"]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: PromptEntry | null
  defaultScope?: PromptScope
  defaultNovelId?: string
  lockNovelScope?: boolean
  onSave: (entry: Omit<PromptEntry, "createdAt"> & { id?: string }) => void
  onPreview?: (entry: PromptEntry) => void
}

function empty(scope: PromptScope = "global", novelId?: string): Omit<PromptEntry, "createdAt"> & { id?: string } {
  return {
    name: "",
    content: "",
    scope,
    novelId: scope === "novel" ? novelId : undefined,
    group: "custom",
    weight: 5,
    active: true,
    isSystem: false,
  }
}

export function PromptEntryDialog({
  open,
  onOpenChange,
  initial,
  defaultScope = "global",
  defaultNovelId,
  lockNovelScope = false,
  onSave,
  onPreview,
}: Props) {
  const { novels } = useStore()
  const [draft, setDraft] = useState(empty(defaultScope, defaultNovelId))

  useEffect(() => {
    if (open) {
      setDraft(initial ? { ...initial } : empty(defaultScope, defaultNovelId))
    }
  }, [open, initial, defaultScope, defaultNovelId])

  function set<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function submit() {
    onSave(draft)
    onOpenChange(false)
  }

  function preview() {
    onPreview?.({
      ...draft,
      id: draft.id ?? "preview",
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-full max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "编辑提示词词条" : "新建提示词词条"}</DialogTitle>
          <DialogDescription>提示词会在 AI 生成时作为规则注入，权重越高越优先。</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="p-name">名称</FieldLabel>
            <Input
              id="p-name"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              disabled={draft.isSystem}
            />
          </Field>
          <Field>
            <FieldLabel>作用域</FieldLabel>
            <Select
              value={draft.scope}
              onValueChange={(v) => {
                const scope = (v ?? "global") as PromptScope
                setDraft((d) => ({
                  ...d,
                  scope,
                  novelId: scope === "novel" ? d.novelId ?? defaultNovelId ?? novels[0]?.id : undefined,
                }))
              }}
              disabled={lockNovelScope || draft.isSystem}
            >
              <SelectTrigger className="w-full">
                <SelectValue>{() => (draft.scope === "global" ? "全局" : "小说级")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="global">全局</SelectItem>
                  <SelectItem value="novel">小说级</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          {draft.scope === "novel" && (
            <Field>
              <FieldLabel>关联小说</FieldLabel>
              <Select
                value={draft.novelId ?? ""}
                onValueChange={(v) => set("novelId", v ?? undefined)}
                disabled={(lockNovelScope && !!defaultNovelId) || draft.isSystem}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {() => novels.find((n) => n.id === draft.novelId)?.title ?? "选择小说"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {novels.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field>
            <FieldLabel>分组</FieldLabel>
            <Select
              value={draft.group}
              onValueChange={(v) => set("group", (v ?? "custom") as PromptGroup)}
              disabled={draft.isSystem}
            >
              <SelectTrigger className="w-full">
                <SelectValue>{() => PROMPT_GROUP_LABELS[draft.group]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {PROMPT_GROUP_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="p-content">内容</FieldLabel>
            <Textarea
              id="p-content"
              value={draft.content}
              onChange={(e) => set("content", e.target.value)}
              className="min-h-[200px] resize-y"
              disabled={draft.isSystem}
            />
          </Field>
          <Field>
            <FieldLabel>
              权重
              <span className="ml-auto tabular-nums text-primary">{draft.weight}</span>
            </FieldLabel>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[draft.weight]}
              onValueChange={(v) => set("weight", Array.isArray(v) ? v[0] : v)}
              disabled={draft.isSystem}
            />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel>启用词条</FieldLabel>
            <Switch checked={draft.active} onCheckedChange={(v) => set("active", v)} />
          </Field>
        </FieldGroup>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={preview} disabled={!draft.content.trim()}>
            <Eye data-icon="inline-start" />
            预览效果
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              onClick={submit}
              disabled={
                draft.isSystem ||
                !draft.name.trim() ||
                !draft.content.trim() ||
                (draft.scope === "novel" && !draft.novelId)
              }
            >
              保存
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
