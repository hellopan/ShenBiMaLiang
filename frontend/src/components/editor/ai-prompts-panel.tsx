"use client"

import { useEffect, useState } from "react"
import { BookText, ChevronDown, Edit2, Lock, Plus, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { uid } from "@/lib/store"
import { type Chapter, type GenParams, type PromptRule, DEFAULT_GEN_PARAMS } from "@/lib/types"

// ── System rule IDs ───────────────────────────────────────────────────────────
const SYSTEM_RULE_CHAPTER_OUTLINE = "sys_chapter_outline"
const SYSTEM_RULE_STYLE = "sys_style_prompt"
const SYSTEM_RULE_FORBID = "sys_forbid_prompt"
function sysActId(index: number) {
  return `sys_act_${index}`
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = {
  chapter: Chapter
  onUpdateChapter: (updater: (c: Chapter) => Chapter) => void
}

type RuleDialogState = {
  open: boolean
  editing: PromptRule | null
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AiPromptsPanel({ chapter, onUpdateChapter }: Props) {
  const [paramsOpen, setParamsOpen] = useState(true)
  const [rulesOpen, setRulesOpen] = useState(true)
  const [ruleDialog, setRuleDialog] = useState<RuleDialogState>({ open: false, editing: null })

  const genParams: GenParams = chapter.genParams ?? DEFAULT_GEN_PARAMS
  const customRules: PromptRule[] = chapter.customRules ?? []
  const systemRuleStates: Record<string, boolean> = chapter.systemRuleStates ?? {}

  function patchParams(patch: Partial<GenParams>) {
    onUpdateChapter((c) => ({
      ...c,
      genParams: { ...(c.genParams ?? DEFAULT_GEN_PARAMS), ...patch },
    }))
  }

  function setSystemRuleState(ruleId: string, enabled: boolean) {
    onUpdateChapter((c) => ({
      ...c,
      systemRuleStates: { ...(c.systemRuleStates ?? {}), [ruleId]: enabled },
    }))
  }

  function saveCustomRule(rule: PromptRule) {
    onUpdateChapter((c) => {
      const existing = c.customRules ?? []
      const idx = existing.findIndex((r) => r.id === rule.id)
      return {
        ...c,
        customRules:
          idx >= 0 ? existing.map((r) => (r.id === rule.id ? rule : r)) : [...existing, rule],
      }
    })
  }

  function deleteCustomRule(id: string) {
    onUpdateChapter((c) => ({
      ...c,
      customRules: (c.customRules ?? []).filter((r) => r.id !== id),
    }))
  }

  function toggleCustomRule(id: string, enabled: boolean) {
    onUpdateChapter((c) => ({
      ...c,
      customRules: (c.customRules ?? []).map((r) =>
        r.id === id ? { ...r, enabled } : r,
      ),
    }))
  }

  // Build system rules list dynamically from chapter data
  const systemRules: Array<{ id: string; name: string; preview: string }> = [
    {
      id: SYSTEM_RULE_CHAPTER_OUTLINE,
      name: "章节大纲",
      preview: chapter.outline || "（未填写）",
    },
    ...chapter.acts.map((act, i) => ({
      id: sysActId(i),
      name: `第 ${i + 1} 幕概要`,
      preview: act.outline || "（未填写）",
    })),
    {
      id: SYSTEM_RULE_STYLE,
      name: "文风提示词",
      preview: chapter.stylePrompt || "（未填写）",
    },
    {
      id: SYSTEM_RULE_FORBID,
      name: "禁止提示词",
      preview: chapter.forbidPrompt || "（未填写）",
    },
  ]

  return (
    <>
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-l border-border bg-sidebar">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">AI 提示词</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0 p-3">
            {/* ── Section 1: Generation params ──────────────────────────── */}
            <Collapsible open={paramsOpen} onOpenChange={setParamsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
                生成参数
                <ChevronDown
                  className={cn("size-3.5 transition-transform", !paramsOpen && "-rotate-90")}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1">
                <div className="flex flex-col gap-4 rounded-md border border-border bg-card/30 p-3">
                  {/* Temperature */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">温度</span>
                      <span className="text-xs tabular-nums text-primary">
                        {genParams.temperature.toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[genParams.temperature]}
                      onValueChange={(v) => patchParams({ temperature: Array.isArray(v) ? v[0] : v })}
                    />
                  </div>

                  {/* Top P */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Top P</span>
                      <span className="text-xs tabular-nums text-primary">
                        {genParams.topP.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[genParams.topP]}
                      onValueChange={(v) => patchParams({ topP: Array.isArray(v) ? v[0] : v })}
                    />
                  </div>

                  {/* Top K */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">Top K</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={genParams.topK}
                      onChange={(e) =>
                        patchParams({ topK: Math.min(100, Math.max(1, Number(e.target.value) || 1)) })
                      }
                      className="w-16 rounded border border-input bg-input/30 px-2 py-1 text-right text-xs tabular-nums text-foreground outline-none focus:border-ring"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-3" />

            {/* ── Section 2: Prompt rules ──────────────────────────────── */}
            <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
              <div className="flex items-center justify-between px-1 py-1.5">
                <CollapsibleTrigger className="flex flex-1 items-center gap-1.5 rounded-md text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
                  <ChevronDown
                    className={cn("size-3.5 transition-transform", !rulesOpen && "-rotate-90")}
                  />
                  规则词条
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
                    {systemRules.filter((r) => systemRuleStates[r.id] !== false).length +
                      customRules.filter((r) => r.enabled).length}
                    /{systemRules.length + customRules.length}
                  </span>
                </CollapsibleTrigger>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setRuleDialog({ open: true, editing: null })}
                  aria-label="添加规则"
                >
                  <Plus className="size-3" />
                </Button>
              </div>

              <CollapsibleContent className="pt-1">
                <div className="flex flex-col gap-1">
                  {/* System rules */}
                  {systemRules.map((rule) => {
                    const enabled = systemRuleStates[rule.id] !== false
                    return (
                      <div
                        key={rule.id}
                        className={cn(
                          "flex items-center gap-2 rounded-md border border-border bg-card/30 px-2 py-2 transition-opacity",
                          !enabled && "opacity-50",
                        )}
                      >
                        <Switch
                          checked={enabled}
                          onCheckedChange={(v) => setSystemRuleState(rule.id, v)}
                          className="shrink-0 scale-75"
                        />
                        <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                          {rule.name}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <Badge
                            variant="secondary"
                            className="h-4 gap-0.5 px-1 py-0 text-[10px] text-muted-foreground"
                          >
                            <Lock className="size-2.5" />
                            系统
                          </Badge>
                        </div>
                      </div>
                    )
                  })}

                  {/* Custom rules */}
                  {customRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md border border-border bg-card/30 px-2 py-2 transition-opacity",
                        !rule.enabled && "opacity-50",
                      )}
                    >
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(v) => toggleCustomRule(rule.id, v)}
                        className="shrink-0 scale-75"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                        {rule.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Badge className="h-4 px-1 py-0 text-[10px] bg-indigo-500/20 text-indigo-400 border-0">
                          自定义
                        </Badge>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="size-5 text-muted-foreground hover:text-foreground"
                          onClick={() => setRuleDialog({ open: true, editing: rule })}
                          aria-label="编辑"
                        >
                          <Edit2 className="size-3" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="size-5 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteCustomRule(rule.id)}
                          aria-label="删除"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {customRules.length === 0 && (
                    <div className="py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <BookText className="size-5 text-muted-foreground/50" />
                        <p className="text-[11px] text-muted-foreground">
                          暂无自定义规则
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </aside>

      {/* ── Rule add/edit dialog ───────────────────────────────────────── */}
      <RuleDialog
        open={ruleDialog.open}
        editing={ruleDialog.editing}
        onOpenChange={(open) => setRuleDialog((s) => ({ ...s, open }))}
        onSave={saveCustomRule}
      />
    </>
  )
}

// ── Rule dialog ───────────────────────────────────────────────────────────────
function RuleDialog({
  open,
  editing,
  onOpenChange,
  onSave,
}: {
  open: boolean
  editing: PromptRule | null
  onOpenChange: (open: boolean) => void
  onSave: (rule: PromptRule) => void
}) {
  const [name, setName] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "")
      setContent(editing?.content ?? "")
    }
  }, [open, editing])

  function handleOpenChange(v: boolean) {
    onOpenChange(v)
  }

  function submit() {
    if (!name.trim()) return
    onSave({
      id: editing?.id ?? uid(),
      name: name.trim(),
      content: content.trim(),
      enabled: editing?.enabled ?? true,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "编辑规则词条" : "新建规则词条"}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="rule-name">词条名称</FieldLabel>
            <Input
              id="rule-name"
              placeholder="例如：主角性格"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="rule-content">词条内容</FieldLabel>
            <Textarea
              id="rule-content"
              rows={5}
              placeholder="在此描述该规则词条的内容，将在 AI 生成时作为提示词注入……"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
