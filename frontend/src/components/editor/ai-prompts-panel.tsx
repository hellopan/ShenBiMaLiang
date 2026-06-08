"use client"

import { useEffect, useState } from "react"
import { BookText, ChevronDown, HelpCircle, Lock, Pencil, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

type SystemRuleEntry = {
  id: string
  name: string
  content: string
  isSystem: true
}

type EditDialogState = {
  open: boolean
  entry: SystemRuleEntry | (PromptRule & { isSystem: false }) | null
  originalContent: string
  originalName: string
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AiPromptsPanel({ chapter, onUpdateChapter }: Props) {
  const [paramsOpen, setParamsOpen] = useState(true)
  const [rulesOpen, setRulesOpen] = useState(true)
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    entry: null,
    originalContent: "",
    originalName: "",
  })

  const genParams: GenParams = chapter.genParams ?? DEFAULT_GEN_PARAMS
  const customRules: PromptRule[] = chapter.customRules ?? []
  const systemRuleStates: Record<string, boolean> = chapter.systemRuleStates ?? {}

  function patchParams(patch: Partial<GenParams>) {
    onUpdateChapter((c) => ({
      ...c,
      genParams: { ...(c.genParams ?? DEFAULT_GEN_PARAMS), ...patch },
    }))
  }

  function handleUnlockToggle(checked: boolean) {
    const currentMax = checked ? 2_000_000 : 1_000_000
    const clampedLength = Math.min(genParams.contextLength, currentMax)
    patchParams({ unlockContext: checked, contextLength: clampedLength })
  }

  function handleContextLengthChange(value: number | readonly number[]) {
    const v = Array.isArray(value) ? (value as number[])[0] : (value as number)
    patchParams({ contextLength: v })
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

  function saveSystemRuleContent(id: string, content: string) {
    onUpdateChapter((c) => {
      if (id === SYSTEM_RULE_CHAPTER_OUTLINE) return { ...c, outline: content }
      if (id === SYSTEM_RULE_STYLE) return { ...c, stylePrompt: content }
      if (id === SYSTEM_RULE_FORBID) return { ...c, forbidPrompt: content }
      if (id.startsWith("sys_act_")) {
        const idx = parseInt(id.replace("sys_act_", ""), 10)
        const acts = c.acts.map((a, i) => (i === idx ? { ...a, outline: content } : a))
        return { ...c, acts }
      }
      return c
    })
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
  const systemRules: SystemRuleEntry[] = [
    {
      id: SYSTEM_RULE_CHAPTER_OUTLINE,
      name: "章节大纲",
      content: chapter.outline || "",
      isSystem: true,
    },
    ...chapter.acts.map((act, i) => ({
      id: sysActId(i),
      name: `第 ${i + 1} 幕概要`,
      content: act.outline || "",
      isSystem: true as const,
    })),
    {
      id: SYSTEM_RULE_STYLE,
      name: "文风提示词",
      content: chapter.stylePrompt || "",
      isSystem: true,
    },
    {
      id: SYSTEM_RULE_FORBID,
      name: "禁止提示词",
      content: chapter.forbidPrompt || "",
      isSystem: true,
    },
  ]

  function openEditForSystem(rule: SystemRuleEntry) {
    setEditDialog({
      open: true,
      entry: rule,
      originalContent: rule.content,
      originalName: rule.name,
    })
  }

  function openEditForCustom(rule: PromptRule) {
    setEditDialog({
      open: true,
      entry: { ...rule, isSystem: false },
      originalContent: rule.content,
      originalName: rule.name,
    })
  }

  function openAddCustom() {
    const newRule: PromptRule & { isSystem: false } = {
      id: uid(),
      name: "",
      content: "",
      enabled: true,
      isSystem: false,
    }
    setEditDialog({ open: true, entry: newRule, originalContent: "", originalName: "" })
  }

  function handleDialogSave(id: string, name: string, content: string, isSystem: boolean) {
    if (isSystem) {
      saveSystemRuleContent(id, content)
    } else {
      const existing = customRules.find((r) => r.id === id)
      saveCustomRule({
        id,
        name,
        content,
        enabled: existing?.enabled ?? true,
      })
    }
    setEditDialog((s) => ({ ...s, open: false }))
  }

  const contextMax = genParams.unlockContext ? 2_000_000 : 1_000_000

  return (
    <TooltipProvider>
        <aside className="flex h-full w-70 shrink-0 flex-col border-l border-border bg-sidebar">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">AI 提示词</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0 p-3">
            {/* ── Section 1: 上下文设置 ──────────────────────────────────── */}
            <Collapsible open={paramsOpen} onOpenChange={setParamsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
                上下文设置
                <ChevronDown
                  className={cn("size-3.5 transition-transform", !paramsOpen && "-rotate-90")}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1">
                <div className="flex flex-col gap-4 rounded-md border border-border bg-card/30 p-3">

                  {/* 解锁上下文长度 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-foreground">解锁上下文长度</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="size-3 cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          AI 可见的最大上下文长度
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      checked={genParams.unlockContext}
                      onCheckedChange={handleUnlockToggle}
                      className="scale-75"
                    />
                  </div>

                  {/* 上下文长度 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-foreground">
                        上下文长度
                        <span className="ml-1 text-muted-foreground">（以词符数计）</span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-primary">
                        {genParams.contextLength.toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      min={1000}
                      max={contextMax}
                      step={1000}
                      value={[genParams.contextLength]}
                      onValueChange={handleContextLengthChange}
                    />
                  </div>

                  {/* 最大回复长度 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-foreground">
                        最大回复长度
                        <span className="ml-1 text-muted-foreground">（以词符数计）</span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-primary">
                        {genParams.maxReplyLength.toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      min={1000}
                      max={100000}
                      step={1000}
                      value={[genParams.maxReplyLength]}
                      onValueChange={(v) => {
                        const val = Array.isArray(v) ? (v as number[])[0] : (v as number)
                        patchParams({ maxReplyLength: val })
                      }}
                    />
                  </div>

                  <Separator />

                  {/* 温度 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground">温度</span>
                      <span className="text-xs tabular-nums text-primary">
                        {genParams.temperature.toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[genParams.temperature]}
                      onValueChange={(v) => {
                        const val = Array.isArray(v) ? (v as number[])[0] : (v as number)
                        patchParams({ temperature: val })
                      }}
                    />
                  </div>

                  {/* Top P */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground">Top P</span>
                      <span className="text-xs tabular-nums text-primary">
                        {genParams.topP.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.05}
                      value={[genParams.topP]}
                      onValueChange={(v) => {
                        const val = Array.isArray(v) ? (v as number[])[0] : (v as number)
                        patchParams({ topP: val })
                      }}
                    />
                  </div>

                  {/* Top K */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-foreground">Top K</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={genParams.topK}
                      onChange={(e) =>
                        patchParams({ topK: Math.min(100, Math.max(1, Number(e.target.value) || 1)) })
                      }
                      className="w-25 rounded border border-input bg-input/30 px-2 py-1 text-right text-xs tabular-nums text-foreground outline-none focus:border-ring"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-3" />

            {/* ── Section 2: 规则词条 ──────────────────────────────────── */}
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
                  onClick={openAddCustom}
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
                          "flex items-center gap-1.5 rounded-md border border-border bg-card/30 px-2 py-2 transition-opacity",
                          !enabled && "opacity-50",
                        )}
                      >
                        <Lock className="size-3 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                          {rule.name}
                        </span>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditForSystem(rule)}
                          aria-label="编辑"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(v) => setSystemRuleState(rule.id, v)}
                          className="shrink-0 scale-75"
                        />
                      </div>
                    )
                  })}

                  {/* Custom rules */}
                  {customRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border border-border bg-card/30 px-2 py-2 transition-opacity",
                        !rule.enabled && "opacity-50",
                      )}
                    >
                      <span className="size-3 shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                        {rule.name}
                      </span>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditForCustom(rule)}
                        aria-label="编辑"
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(v) => toggleCustomRule(rule.id, v)}
                        className="shrink-0 scale-75"
                      />
                    </div>
                  ))}

                  {customRules.length === 0 && systemRules.length === 0 && (
                    <div className="py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <BookText className="size-5 text-muted-foreground/50" />
                        <p className="text-[11px] text-muted-foreground">暂无规则词条</p>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </aside>

      {/* ── Rule edit dialog ─────────────────────────────────────────────── */}
      {editDialog.entry && (
        <RuleEditDialog
          open={editDialog.open}
          entry={editDialog.entry}
          originalContent={editDialog.originalContent}
          originalName={editDialog.originalName}
          onOpenChange={(open) => setEditDialog((s) => ({ ...s, open }))}
          onSave={handleDialogSave}
        />
      )}
    </TooltipProvider>
  )
}

// ── Rule edit dialog ──────────────────────────────────────────────────────────
type EditableEntry = (SystemRuleEntry | (PromptRule & { isSystem: false }))

function RuleEditDialog({
  open,
  entry,
  originalContent,
  originalName,
  onOpenChange,
  onSave,
}: {
  open: boolean
  entry: EditableEntry
  originalContent: string
  originalName: string
  onOpenChange: (open: boolean) => void
  onSave: (id: string, name: string, content: string, isSystem: boolean) => void
}) {
  const [name, setName] = useState(entry.name)
  const [content, setContent] = useState(entry.content)

  useEffect(() => {
    if (open) {
      setName(entry.name)
      setContent(entry.content)
    }
  }, [open, entry])

  function handleReset() {
    setName(originalName)
    setContent(originalContent)
  }

  function handleSave() {
    if (!entry.isSystem && !name.trim()) return
    onSave(entry.id, name.trim(), content.trim(), entry.isSystem)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-200 max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry.name || "新建规则词条"}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="rule-name">名称</FieldLabel>
            <Input
              id="rule-name"
              placeholder="例如：主角性格"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={entry.isSystem}
              readOnly={entry.isSystem}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="rule-content">提示词内容</FieldLabel>
            <Textarea
              id="rule-content"
              rows={6}
              placeholder="在此描述该规则词条的内容，将在 AI 生成时作为提示词注入……"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-100"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <Button
            onClick={handleSave}
            disabled={!entry.isSystem && !name.trim()}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
