"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Play, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { type Chapter, type Act, type ModelConfig, wordCount } from "@/lib/types"

const MOCK_EXPAND =
  "夜色如墨，泼洒在青云山脉连绵的峰峦之上。林墨独自盘膝坐在断崖边，残剑横于膝前，剑身上那层经年的锈迹在月光下泛着幽冷的微光。他闭目凝神，引导着体内那道初醒的灵脉缓缓流转，每一次呼吸都仿佛与天地间无形的气机共鸣。\n\n忽然，残剑轻轻一颤，发出一声几不可闻的清鸣。林墨睁开双眼，眸中映着剑光，亦映着远方翻涌的云海。他知道，从踏入裂谷的那一刻起，命运的齿轮便已不可逆转地转动起来。前路漫漫，纵有万难，他也要握紧手中这柄古剑，一步步走向那传说中的星河之巅。"

type Props = {
  chapter: Chapter
  models: ModelConfig[]
  onChangeTitle: (title: string) => void
  onChangeOutline: (outline: string) => void
  onChangeStylePrompt: (v: string) => void
  onChangeForbidPrompt: (v: string) => void
  onChangeAct: (actId: string, patch: Partial<Act>) => void
  onAddAct: () => void
  onDeleteAct: (actId: string) => void
}

export function ChapterEditor({
  chapter,
  models,
  onChangeTitle,
  onChangeOutline,
  onChangeStylePrompt,
  onChangeForbidPrompt,
  onChangeAct,
  onAddAct,
  onDeleteAct,
}: Props) {
  const [outlineOpen, setOutlineOpen] = useState(true)
  const [styleOpen, setStyleOpen] = useState(false)
  const [forbidOpen, setForbidOpen] = useState(false)

  const activeModels = models.filter((m) => m.active)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-8">
      {/* Editable chapter title */}
      <input
        value={chapter.title}
        onChange={(e) => onChangeTitle(e.target.value)}
        className="w-full bg-transparent text-2xl font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground focus:border-b focus:border-border"
        placeholder="章节标题"
        aria-label="章节标题"
      />

      {/* Chapter outline (collapsible) */}
      <Collapsible open={outlineOpen} onOpenChange={setOutlineOpen}>
        <CollapsibleTrigger
          render={
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground" />
          }
        >
          <ChevronDown className={cn("size-3.5 transition-transform", !outlineOpen && "-rotate-90")} />
          章节大纲
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Textarea
            value={chapter.outline}
            onChange={(e) => onChangeOutline(e.target.value)}
            placeholder="梳理本章的核心情节走向……"
            rows={3}
            className="resize-none bg-muted/40"
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Style prompt (collapsible) */}
      <Collapsible open={styleOpen} onOpenChange={setStyleOpen}>
        <CollapsibleTrigger
          render={
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground" />
          }
        >
          <ChevronDown className={cn("size-3.5 transition-transform", !styleOpen && "-rotate-90")} />
          文风提示词
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Textarea
            value={chapter.stylePrompt ?? ""}
            onChange={(e) => onChangeStylePrompt(e.target.value)}
            placeholder="描述本章希望呈现的文风、语气与叙事风格……"
            rows={3}
            className="resize-none bg-muted/40"
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Forbidden prompt (collapsible) */}
      <Collapsible open={forbidOpen} onOpenChange={setForbidOpen}>
        <CollapsibleTrigger
          render={
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground" />
          }
        >
          <ChevronDown className={cn("size-3.5 transition-transform", !forbidOpen && "-rotate-90")} />
          禁止提示词
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Textarea
            value={chapter.forbidPrompt ?? ""}
            onChange={(e) => onChangeForbidPrompt(e.target.value)}
            placeholder="列出 AI 生成时应避免出现的内容、词汇或情节……"
            rows={3}
            className="resize-none bg-muted/40"
          />
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Acts */}
      <div className="flex flex-col gap-5">
        {chapter.acts.map((act, i) => (
          <ActBlock
            key={act.id}
            index={i}
            act={act}
            models={activeModels}
            onChange={(patch) => onChangeAct(act.id, patch)}
            onDelete={() => onDeleteAct(act.id)}
            canDelete={chapter.acts.length > 1}
          />
        ))}
      </div>

      <Button variant="outline" onClick={onAddAct} className="self-start">
        <Plus data-icon="inline-start" />
        添加幕
      </Button>
    </div>
  )
}

// ── Act block ─────────────────────────────────────────────────────────────────
function ActBlock({
  index,
  act,
  models,
  onChange,
  onDelete,
  canDelete,
}: {
  index: number
  act: Act
  models: ModelConfig[]
  onChange: (patch: Partial<Act>) => void
  onDelete: () => void
  canDelete: boolean
}) {
  const [generating, setGenerating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => () => stopTimer(), [])

  function handleExpand() {
    if (generating) {
      stopTimer()
      setGenerating(false)
      return
    }
    stopTimer()
    setGenerating(true)
    const full = MOCK_EXPAND
    let i = act.content.length > 0 ? act.content.length : 0
    const base = act.content ? `${act.content}\n\n` : ""
    // Reset to base before streaming
    onChange({ content: base })
    let streamed = 0
    timerRef.current = setInterval(() => {
      streamed += 1
      onChange({ content: base + full.slice(0, streamed) })
      if (streamed >= full.length) {
        stopTimer()
        setGenerating(false)
      }
    }, 20)
  }

  const selectedModel = models.find((m) => m.id === act.modelId) ?? models[0]

  return (
    <section className="rounded-lg border border-border bg-card/40">
      <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="text-sm font-medium text-foreground">第 {index + 1} 幕</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {wordCount(act.content)} 字
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Per-act model selector */}
        {models.length > 0 && (
          <Select
            value={act.modelId ?? models[0]?.id ?? ""}
            onValueChange={(v) => onChange({ modelId: v ?? undefined })}
          >
            <SelectTrigger
              size="sm"
              className="h-6 w-auto gap-1 border-0 bg-transparent px-1.5 text-xs text-muted-foreground shadow-none hover:bg-accent hover:text-foreground focus:ring-0"
            >
              <SelectValue>
                {() => selectedModel?.label ?? "选择模型"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {/* Expand button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExpand}
          className={cn(
            "h-6 gap-1 px-2 text-xs",
            generating && "text-primary",
          )}
        >
          <Play className={cn("size-3", generating && "animate-pulse")} />
          {generating ? "停止" : "扩写"}
        </Button>

        {/* Delete */}
        {canDelete && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onDelete}
            aria-label="删除本幕"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
          </Button>
        )}
      </header>

      <div className="flex flex-col gap-0 p-4">
        <Textarea
          value={act.outline}
          onChange={(e) => onChange({ outline: e.target.value })}
          placeholder="本幕大纲：这一幕要发生什么？"
          rows={2}
          className="resize-none border-0 bg-transparent px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <Separator className="my-3" />
        <Textarea
          value={act.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="正文内容……"
          rows={6}
          className="resize-none border-0 bg-transparent px-0 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        {generating && (
          <span className="ml-0.5 mt-1 inline-block h-4 w-0.5 animate-pulse bg-primary align-text-bottom" />
        )}
      </div>
    </section>
  )
}
