"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BookText,
  ChevronDown,
  Eye,
  HelpCircle,
  Lock,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { PromptPreviewSheet } from "@/components/prompts/prompt-preview-sheet"
import { cn } from "@/lib/utils"
import { uid, useStore } from "@/lib/store"
import {
  type Act,
  type ActAIConfig,
  type Chapter,
  type ModelConfig,
  type PromptRule,
  type PromptEntry,
  makeDefaultActConfig,
  getActColor,
  resolvePromptActive,
  PROMPT_GROUP_LABELS,
  PROMPT_GROUP_BADGE_CLASS,
} from "@/lib/types"

const SYS_CHAPTER_OUTLINE = "sys_chapter_outline"
function sysActId(index: number) {
  return `sys_act_${index}`
}

type Props = {
  novelId: string
  chapter: Chapter
  acts: Act[]
  activeActId: string | null
  actConfigs: Record<string, ActAIConfig>
  models: ModelConfig[]
  onActConfigChange: (actId: string, patch: Partial<ActAIConfig>) => void
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
  entry: PromptRule & { isSystem: false } | null
  originalContent: string
  originalName: string
}

export function AiPromptsPanel({
  novelId,
  chapter,
  acts,
  activeActId,
  actConfigs,
  models,
  onActConfigChange,
  onUpdateChapter,
}: Props) {
  const { getPromptEntriesForNovel } = useStore()
  const [paramsOpen, setParamsOpen] = useState(true)
  const [rulesOpen, setRulesOpen] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    entry: null,
    originalContent: "",
    originalName: "",
  })

  const actConfig: ActAIConfig | null = activeActId
    ? (actConfigs[activeActId] ?? makeDefaultActConfig(activeActId, models[0]?.id ?? ""))
    : null

  const activeActIndex = activeActId ? acts.findIndex((a) => a.id === activeActId) : -1
  const activeActColor = activeActIndex >= 0 ? getActColor(activeActIndex) : undefined
  const customRules: PromptRule[] = actConfig?.customRules ?? []
  const inheritedEntries = getPromptEntriesForNovel(novelId)

  const activeEntryIds = useMemo(() => {
    if (!actConfig) return []
    return inheritedEntries
      .filter((e) => resolvePromptActive(e, actConfig.promptOverrides))
      .map((e) => e.id)
  }, [inheritedEntries, actConfig])

  function patchConfig(patch: Partial<ActAIConfig>) {
    if (!activeActId) return
    onActConfigChange(activeActId, patch)
  }

  function getRuleState(ruleId: string): boolean {
    return actConfig?.ruleStates[ruleId] !== false
  }

  function setRuleState(ruleId: string, enabled: boolean) {
    if (!activeActId || !actConfig) return
    onActConfigChange(activeActId, {
      ruleStates: { ...actConfig.ruleStates, [ruleId]: enabled },
    })
  }

  function getPromptActive(entry: PromptEntry): boolean {
    return resolvePromptActive(entry, actConfig?.promptOverrides ?? [])
  }

  function setPromptActive(entryId: string, active: boolean) {
    if (!activeActId || !actConfig) return
    const rest = actConfig.promptOverrides.filter((o) => o.entryId !== entryId)
    onActConfigChange(activeActId, {
      promptOverrides: [...rest, { entryId, active }],
    })
  }

  function saveCustomRule(rule: PromptRule) {
    if (!activeActId || !actConfig) return
    const existing = actConfig.customRules ?? []
    const idx = existing.findIndex((r) => r.id === rule.id)
    onActConfigChange(activeActId, {
      customRules:
        idx >= 0 ? existing.map((r) => (r.id === rule.id ? rule : r)) : [...existing, rule],
    })
  }

  function deleteCustomRule(id: string) {
    if (!activeActId || !actConfig) return
    onActConfigChange(activeActId, {
      customRules: (actConfig.customRules ?? []).filter((r) => r.id !== id),
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

  function handleDialogSave(id: string, name: string, content: string) {
    const existing = customRules.find((r) => r.id === id)
    saveCustomRule({ id, name, content, enabled: existing?.enabled ?? true })
    setEditDialog((s) => ({ ...s, open: false }))
  }

  const systemRules: SystemRuleEntry[] = [
    { id: SYS_CHAPTER_OUTLINE, name: "章节大纲", content: chapter.outline || "", isSystem: true },
    ...acts.map((act, i) => ({
      id: sysActId(i),
      name: `第 ${i + 1} 幕概要`,
      content: act.outline || "",
      isSystem: true as const,
    })),
  ]

  const enabledCount =
    systemRules.filter((r) => getRuleState(r.id)).length +
    inheritedEntries.filter((e) => getPromptActive(e)).length +
    customRules.filter((r) => r.enabled).length

  const contextMax = actConfig?.contextUnlocked ? 2_000_000 : 1_000_000

  return (
    <TooltipProvider>
      <aside
        className="flex h-full w-70 shrink-0 flex-col bg-sidebar"
        style={{
          borderLeft: `4px solid ${activeActColor ?? "var(--border)"}`,
          transition: "border-color 0.3s ease",
        }}
      >
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Settings2 className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">AI 配置</h2>
          </div>
          {activeActIndex >= 0 ? (
            <p
              className="mt-0.5 text-xs font-medium"
              style={{ color: activeActColor, transition: "color 0.3s ease" }}
            >
              {chapter.title} › 第 {activeActIndex + 1} 幕
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">请选择一幕开始编辑</p>
          )}
        </div>

        {!actConfig ? (
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <p className="text-xs text-muted-foreground">
              点击幕标题行的 ⚙ 图标或聚焦文本区来选择幕
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-0 p-3">
              {/* ── 规则词条 ─────────────────────────────────────────── */}
              <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
                <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
                  <ChevronDown
                    className={cn("size-3.5 transition-transform", !rulesOpen && "-rotate-90")}
                  />
                  规则词条
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
                    {enabledCount}/{systemRules.length + inheritedEntries.length + customRules.length}
                  </span>
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-1">
                  <div className="flex flex-col gap-3">
                    {/* 系统词条 */}
                    <div className="flex flex-col gap-1">
                      <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        系统词条
                      </p>
                      {systemRules.map((rule) => {
                        const enabled = getRuleState(rule.id)
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
                            <Badge variant="outline" className="text-[9px] bg-muted/60 text-muted-foreground">
                              系统
                            </Badge>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => setPreviewOpen(true)}
                              aria-label="预览"
                            >
                              <Eye className="size-3" />
                            </Button>
                            <Switch
                              checked={enabled}
                              onCheckedChange={(v) => setRuleState(rule.id, v)}
                              className="shrink-0 scale-75"
                            />
                          </div>
                        )
                      })}
                    </div>

                    {/* 继承词条 */}
                    {inheritedEntries.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          继承词条
                        </p>
                        {inheritedEntries.map((entry) => {
                          const enabled = getPromptActive(entry)
                          return (
                            <div
                              key={entry.id}
                              className={cn(
                                "flex items-center gap-1.5 rounded-md border border-border bg-card/30 px-2 py-2 transition-opacity",
                                !enabled && "opacity-50",
                              )}
                            >
                              <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                                {entry.name}
                              </span>
                              <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400">
                                继承
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn("text-[9px]", PROMPT_GROUP_BADGE_CLASS[entry.group])}
                              >
                                {PROMPT_GROUP_LABELS[entry.group]}
                              </Badge>
                              <Switch
                                checked={enabled}
                                onCheckedChange={(v) => setPromptActive(entry.id, v)}
                                className="shrink-0 scale-75"
                              />
                            </div>
                          )
                        })}
                        <Link
                          href="/prompts"
                          className="px-1 pt-1 text-[11px] text-primary hover:underline"
                        >
                          管理词条库 →
                        </Link>
                      </div>
                    )}

                    {/* 本幕自定义 */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          本幕自定义
                        </p>
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
                      {customRules.map((rule) => (
                        <div
                          key={rule.id}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md border border-border bg-card/30 px-2 py-2 transition-opacity",
                            !rule.enabled && "opacity-50",
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                            {rule.name}
                          </span>
                          <Badge variant="outline" className="text-[9px] bg-indigo-500/10 text-indigo-400">
                            自定义
                          </Badge>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="size-5 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteCustomRule(rule.id)}
                            aria-label="删除"
                          >
                            <Trash2 className="size-3" />
                          </Button>
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
                            onCheckedChange={(v) => saveCustomRule({ ...rule, enabled: v })}
                            className="shrink-0 scale-75"
                          />
                        </div>
                      ))}
                    </div>

                    {systemRules.length === 0 &&
                      inheritedEntries.length === 0 &&
                      customRules.length === 0 && (
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

              <Button
                variant="outline"
                size="sm"
                className="my-3 w-full"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="size-3.5" />
                预览提示词
              </Button>

              <Separator className="mb-3" />

              {/* ── 上下文与生成参数 ───────────────────────────────────── */}
              <Collapsible open={paramsOpen} onOpenChange={setParamsOpen}>
                <CollapsibleTrigger className="flex flex-1 items-center gap-1.5 justify-between rounded-md px-1 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
                  <ChevronDown
                    className={cn("size-3.5 transition-transform", !paramsOpen && "-rotate-90")}
                  />
                  上下文设置
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-1">
                  <div className="flex flex-col gap-4 rounded-md border border-border bg-card/30 p-3">
                    {models.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-foreground">模型</span>
                        <Select
                          value={actConfig.model || models[0]?.id || ""}
                          onValueChange={(v) => patchConfig({ model: v ?? "" })}
                        >
                          <SelectTrigger size="sm" className="w-full text-xs">
                            <SelectValue>
                              {() =>
                                models.find((m) => m.id === actConfig.model)?.label ??
                                models[0]?.label ??
                                "选择模型"
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {models.map((m) => (
                                <SelectItem key={m.id} value={m.id} className="text-xs">
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-foreground">解锁上下文长度</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="size-3 cursor-help text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent side="top">AI 可见的最大上下文长度</TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch
                        checked={actConfig.contextUnlocked}
                        onCheckedChange={(v) => {
                          const clampedLength = Math.min(
                            actConfig.contextLength,
                            v ? 2_000_000 : 1_000_000,
                          )
                          patchConfig({ contextUnlocked: v, contextLength: clampedLength })
                        }}
                        className="scale-75"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-foreground">
                          上下文长度
                          <span className="ml-1 text-muted-foreground">（词符）</span>
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-primary">
                          {actConfig.contextLength.toLocaleString()}
                        </span>
                      </div>
                      <Slider
                        min={1000}
                        max={contextMax}
                        step={1000}
                        value={[actConfig.contextLength]}
                        onValueChange={(v) =>
                          patchConfig({ contextLength: Array.isArray(v) ? v[0] : v })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-foreground">
                          最大回复长度
                          <span className="ml-1 text-muted-foreground">（词符）</span>
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-primary">
                          {actConfig.maxTokens.toLocaleString()}
                        </span>
                      </div>
                      <Slider
                        min={1000}
                        max={100000}
                        step={1000}
                        value={[actConfig.maxTokens]}
                        onValueChange={(v) =>
                          patchConfig({ maxTokens: Array.isArray(v) ? v[0] : v })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground">温度</span>
                        <span className="text-xs tabular-nums text-primary">
                          {actConfig.temperature.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={[actConfig.temperature]}
                        onValueChange={(v) =>
                          patchConfig({ temperature: Array.isArray(v) ? v[0] : v })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground">Top P</span>
                        <span className="text-xs tabular-nums text-primary">
                          {actConfig.topP.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[actConfig.topP]}
                        onValueChange={(v) => patchConfig({ topP: Array.isArray(v) ? v[0] : v })}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-foreground">Top K</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={actConfig.topK}
                        onChange={(e) =>
                          patchConfig({
                            topK: Math.min(100, Math.max(1, Number(e.target.value) || 1)),
                          })
                        }
                        className="w-25 rounded border border-input bg-input/30 px-2 py-1 text-right text-xs tabular-nums text-foreground outline-none focus:border-ring"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        )}
      </aside>

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

      <PromptPreviewSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        novelId={novelId}
        chapterId={chapter.id}
        actId={activeActId ?? undefined}
        mode="expand"
        activeEntryIds={activeEntryIds}
      />
    </TooltipProvider>
  )
}

function RuleEditDialog({
  open,
  entry,
  originalContent,
  originalName,
  onOpenChange,
  onSave,
}: {
  open: boolean
  entry: PromptRule & { isSystem: false }
  originalContent: string
  originalName: string
  onOpenChange: (open: boolean) => void
  onSave: (id: string, name: string, content: string) => void
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
    if (!name.trim()) return
    onSave(entry.id, name.trim(), content.trim())
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
          <Button onClick={handleSave} disabled={!name.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
