"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Eye, Play, Plus, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PromptPreviewSheet } from "@/components/prompts/prompt-preview-sheet"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import { type Chapter, type Act, type Novel, wordCount, getActColor } from "@/lib/types"

// ── Mock expand builder ───────────────────────────────────────────────────────

const GENRE_EXPAND_TEMPLATES: Record<string, string[]> = {
  玄幻修真: [
    "夜色如墨，泼洒在连绵的峰峦之上。{name}独自盘膝坐在断崖边，残剑横于膝前，剑身上那层经年的锈迹在月光下泛着幽冷的微光。他闭目凝神，引导着体内那道初醒的灵脉缓缓流转，每一次呼吸都仿佛与天地间无形的气机共鸣。",
    "忽然，残剑轻轻一颤，发出一声几不可闻的清鸣。{name}睁开双眼，眸中映着剑光，亦映着远方翻涌的云海。他知道，从踏入裂谷的那一刻起，命运的齿轮便已不可逆转地转动起来。前路漫漫，纵有万难，他也要握紧手中这柄古剑，一步步走向那传说中的星河之巅。",
  ],
  悬疑推理: [
    "雾从河面爬上来，悄无声息地漫过街道，将路灯拉扯成一圈朦胧的光晕。{name}站在案发现场的门口，烟蒂在指间燃尽也没有察觉。地上那道血迹的走向不对——受害者倒下之前，明明向左转了身。",
    "「有人特意改变了现场。」他低声自语，声音被浓雾吞没，只剩下远处隐约的汽笛声。真相就在这片{genre}的迷雾里，等着被人看见。",
  ],
  科幻太空: [
    "警报声刺穿了休眠舱的静默，红色频闪灯将整个舱室染成血色。{name}从休眠椅上弹坐起来，肺里还残留着冷冻液的寒意，手却已经摸向了控制台。导航屏上那条轨迹线偏了至少二十度——三百年，都走偏了。",
    "「ARIA，报告状态。」他的声音沙哑，在空荡的舱室里回响。舰载AI沉默了零点七秒，这个对于光速处理器来说漫长的停顿，让{name}的手心渗出了冷汗。",
  ],
}

const FALLBACK_EXPAND = [
  "光线透过窗棂斜斜地洒进来，尘埃在其中轻轻飞舞。{name}沉默地看着眼前的一切，心中有什么东西在悄悄松动。有些事情，到了该面对的时候了。",
  "沉默在两人之间蔓延，比任何言语都更沉重。{name}终于开口，声音比预想中平静了许多。那些埋藏已久的话，就这样一字一句地说了出来。",
]

function buildMockExpand(act: Act, novel: Novel): string {
  const templates = GENRE_EXPAND_TEMPLATES[novel.genre] ?? FALLBACK_EXPAND
  const paragraphs = templates.map((t) =>
    t
      .replace(/\{name\}/g, novel.title)
      .replace(/\{genre\}/g, novel.genre),
  )
  const prefix = act.outline ? `${act.outline}\n\n` : ""
  return prefix + paragraphs.join("\n\n")
}

type Props = {
  novelId: string
  novel: Novel
  chapter: Chapter
  activeActId: string | null
  onChangeTitle: (title: string) => void
  onChangeOutline: (outline: string) => void
  onChangeAct: (actId: string, patch: Partial<Act>) => void
  onAddAct: () => void
  onDeleteAct: (actId: string) => void
  onActFocus: (actId: string) => void
  onActSettingsClick: (actId: string) => void
}

export function ChapterEditor({
  novelId,
  novel,
  chapter,
  activeActId,
  onChangeTitle,
  onChangeOutline,
  onChangeAct,
  onAddAct,
  onDeleteAct,
  onActFocus,
  onActSettingsClick,
}: Props) {
  const [outlineOpen, setOutlineOpen] = useState(true)

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

      <Separator />

      {/* Acts */}
      <div className="flex flex-col gap-5">
        {chapter.acts.map((act, i) => (
          <ActBlock
            key={act.id}
            novelId={novelId}
            novel={novel}
            chapterId={chapter.id}
            index={i}
            act={act}
            color={getActColor(i)}
            isActive={act.id === activeActId}
            onChange={(patch) => onChangeAct(act.id, patch)}
            onDelete={() => onDeleteAct(act.id)}
            onFocus={() => onActFocus(act.id)}
            onSettingsClick={() => onActSettingsClick(act.id)}
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
  novelId,
  novel,
  chapterId,
  index,
  act,
  color,
  isActive,
  onChange,
  onDelete,
  onFocus,
  onSettingsClick,
  canDelete,
}: {
  novelId: string
  novel: Novel
  chapterId: string
  index: number
  act: Act
  color: string
  isActive: boolean
  onChange: (patch: Partial<Act>) => void
  onDelete: () => void
  onFocus: () => void
  onSettingsClick: () => void
  canDelete: boolean
}) {
  const [generating, setGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
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
    const full = buildMockExpand(act, novel)
    const base = act.content ? `${act.content}\n\n` : ""
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

  return (
    <section
      className="rounded-lg border bg-card/40"
      style={{
        borderColor: isActive ? color : undefined,
        borderWidth: isActive ? "2px" : "1px",
        transition: "border-color 0.25s ease",
      }}
    >
      <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        {/* Colored dot — always visible, encodes act identity */}
        <span
          className="inline-block shrink-0 rounded-full"
          style={{ width: 8, height: 8, backgroundColor: color }}
        />
        <span className="text-sm font-medium text-foreground">第 {index + 1} 幕</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {wordCount(act.content)} 字
        </span>

        <div className="flex-1" />

        {/* Settings icon — focuses this act's config in right panel */}
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onSettingsClick}
          aria-label="AI 配置"
          className={cn(
            "h-6 w-6 transition-colors",
            isActive ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Settings className="size-3.5" />
        </Button>

        {/* Preview + Expand */}
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setPreviewOpen(true)}
          aria-label="预览提示词"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <Eye className="size-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExpand}
          className={cn("h-6 gap-1 px-2 text-xs", generating && "text-primary")}
        >
          <Play className={cn("size-3", generating && "animate-pulse")} />
          {generating ? "停止" : "扩写"}
        </Button>

        {/* Delete */}
        {canDelete && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setDeleteConfirmOpen(true)}
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
          onFocus={onFocus}
          placeholder="本幕大纲：这一幕要发生什么？"
          rows={2}
          className="resize-none border-0 bg-transparent px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <Separator className="my-3" />
        <Textarea
          value={act.content}
          onChange={(e) => onChange({ content: e.target.value })}
          onFocus={onFocus}
          placeholder="正文内容……"
          rows={6}
          className="resize-none border-0 bg-transparent px-0 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        {generating && (
          <span className="ml-0.5 mt-1 inline-block h-4 w-0.5 animate-pulse bg-primary align-text-bottom" />
        )}
      </div>

      <PromptPreviewSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        novelId={novelId}
        chapterId={chapterId}
        actId={act.id}
        mode="expand"
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="删除本幕"
        description={`确定要删除第 ${index + 1} 幕吗？幕内正文将一并删除，此操作不可撤销。`}
        confirmLabel="删除"
        onConfirm={onDelete}
      />
    </section>
  )
}
