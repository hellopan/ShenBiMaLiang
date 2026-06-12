"use client"

import React, { use, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { notFound } from "next/navigation"
import {
  BookOpen,
  CalendarRange,
  ChevronDown,
  Download,
  Eye,
  FileText,
  GitFork,
  GripVertical,
  PenLine,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { EncyclopediaPanel } from "@/components/encyclopedia/encyclopedia-panel"
import { PromptEntriesPanel } from "@/components/prompts/prompt-entries-panel"
import { NovelAIConfigForm } from "@/components/prompts/novel-ai-config-form"
import { PromptPreviewSheet } from "@/components/prompts/prompt-preview-sheet"
import { useStore, uid } from "@/lib/store"
import {
  type Novel,
  type ModelConfig,
  DEFAULT_OUTLINE_AI_CONFIG,
  DEFAULT_CONTENT_AI_CONFIG,
  novelWordCount,
  chapterWordCount,
  relativeTime,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  getGenreGradient,
  getChapterTemplates,
  getActTemplates,
  resolveGenreTemplateKey,
  parseGenres,
  formatGenres,
} from "@/lib/genres"
import { NovelGenrePicker } from "@/components/novel-genre-picker"
import { PresetTagPicker } from "@/components/preset-tag-picker"
import { SectionCompletenessBar } from "@/components/section-completeness-bar"
import {
  NARRATIVE_PERSPECTIVES,
  STORY_TONES,
  PLOT_PACINGS,
  ROMANCE_LINE_PRESETS,
  CONFLICT_TYPE_PRESETS,
} from "@/lib/novel-meta"
import {
  calcBasicInfoCompleteness,
  getBasicInfoCompletenessDisplay,
} from "@/lib/section-completeness/basic-info"

// ── Section metadata ────────────────────────────────────────────────────
const SECTION_TITLES: Record<string, string> = {
  overview: "总览",
  basic: "基本信息",
  outline: "大纲生成",
  chapters: "章节概览",
  encyclopedia: "世界词条",
  prompts: "提示词",
  timeline: "时间线",
  "character-status": "人物状态",
  characters: "人物关系图",
  export: "导出",
}

// ── Mock outline data ─────────────────────────────────────────────────────
type MockAct = { outline: string }
type MockChapter = { title: string; summary: string; acts: MockAct[] }

function buildMockOutline(
  novel: Novel,
  chapterCount: number,
  actsPerChapter: number,
): MockChapter[] {
  const templateKey = resolveGenreTemplateKey(novel.genre)
  const chapterTemplates = getChapterTemplates(templateKey)
  const actTemplates = getActTemplates(templateKey)
  return Array.from({ length: chapterCount }, (_, ci) => {
    const t = chapterTemplates[ci % chapterTemplates.length]
    return {
      title: ci === 0 ? t.title : `第${ci + 1}章 ${t.title}`,
      summary: t.summary.replace(/主角/g, novel.title),
      acts: Array.from({ length: actsPerChapter }, (_, ai) => ({
        outline: actTemplates[ai % actTemplates.length],
      })),
    }
  })
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function NovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { novels, updateNovel, models } = useStore()
  const novel = novels.find((n) => n.id === id)
  const [activeSection, setActiveSection] = useState("overview")
  const activeModels = useMemo(() => models.filter((m) => m.active), [models])

  useEffect(() => {
    const section = searchParams.get("section")
    if (section && section in SECTION_TITLES) {
      setActiveSection(section)
    }
  }, [searchParams])

  if (!novel) return notFound()

  const totalWords = novelWordCount(novel)

  function patch(updater: (n: Novel) => Partial<Novel>) {
    updateNovel(id, (n) => ({ ...n, ...updater(n) }))
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-transparent">
        <AppSidebar
          mode="novel"
          activeItem={activeSection}
          novelId={id}
          novelTitle={novel.title}
          onNavigate={setActiveSection}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable section content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {activeSection === "overview" && (
              <SectionOverview
                novel={novel}
                totalWords={totalWords}
                onNavigate={setActiveSection}
                novelId={id}
              />
            )}
            {activeSection === "basic" && (
              <SectionBasicInfo novel={novel} patch={patch} />
            )}
            {activeSection === "outline" && (
              <SectionOutlineGen
                novel={novel}
                models={activeModels}
                novelId={id}
                patch={patch}
                onApply={(chapters) => {
                  updateNovel(id, (n) => ({
                    ...n,
                    chapters: chapters.map((c, ci) => ({
                      id: uid(),
                      title: c.title,
                      outline: c.summary,
                      expanded: ci === 0,
                      acts: c.acts.map((a) => ({ id: uid(), outline: a.outline, content: "" })),
                    })),
                  }))
                  router.push(`/editor/${id}`)
                }}
              />
            )}
            {activeSection === "chapters" && (
              <SectionChapterOverview novel={novel} novelId={id} models={activeModels} patch={patch} />
            )}
            {activeSection === "encyclopedia" && <EncyclopediaPanel novelId={id} />}
            {activeSection === "prompts" && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  该小说的专属词条与继承的全局词条。全局词条请在
                  <button
                    type="button"
                    className="mx-1 text-primary hover:underline"
                    onClick={() => router.push("/prompts")}
                  >
                    提示词库
                  </button>
                  中管理。
                </p>
                <PromptEntriesPanel novelId={id} showScopeFilter={false} />
              </div>
            )}
            {activeSection === "timeline" && <SectionPlaceholder icon={CalendarRange} title="时间线" description="梳理故事发展的时间轴，追踪关键事件节点与时间跨度" />}
            {activeSection === "character-status" && <SectionPlaceholder icon={Users} title="人物状态" description="追踪每个章节中角色的状态变化、属性成长与当前处境" />}
            {activeSection === "characters" && <SectionPlaceholder icon={GitFork} title="人物关系图" description="可视化展示小说中角色之间的关系网络，支持自定义关系类型" />}
            {activeSection === "export" && <SectionExport novel={novel} />}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}

// ── Section: 总览 ─────────────────────────────────────────────────────────
function SectionOverview({
  novel,
  totalWords,
  onNavigate,
  novelId,
}: {
  novel: Novel
  totalWords: number
  onNavigate: (s: string) => void
  novelId: string
}) {
  const router = useRouter()
  const gradient = getGenreGradient(novel.genre)

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Cover + synopsis */}
      <div className="flex gap-6">
        <div
          className={cn(
            "shrink-0 overflow-hidden rounded-xl bg-gradient-to-br shadow-lg",
            gradient,
          )}
          style={{ width: 140, height: 186 }}
        >
          <div className="flex h-full flex-col justify-end bg-gradient-to-t from-black/50 to-transparent p-3">
            <p className="line-clamp-3 text-xs leading-relaxed text-white/80">{novel.synopsis}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{novel.title}</h2>
            <Badge variant="secondary">{novel.genre}</Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
            {novel.synopsis || "暂无简介"}
          </p>
          <div className="mt-auto flex gap-4 pt-2">
            <Button
              className="h-12 justify-center rounded-xl px-8 text-base font-semibold"
              onClick={() => router.push(`/editor/${novelId}`)}
            >
              <PenLine className="size-5" />
              开始创作
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "h-12 justify-center rounded-xl border-0 px-8 text-base font-semibold text-white",
                "!bg-[linear-gradient(135deg,#8b5cf6_0%,#06b6d4_100%)]",
                "shadow-[0_0_20px_rgba(139,92,246,0.4)]",
                "transition-all duration-200",
                "hover:!bg-[linear-gradient(135deg,#9333ea_0%,#0891b2_100%)]",
                "hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]",
                "hover:!text-white",
              )}
              onClick={() => onNavigate("outline")}
            >
              <Sparkles className="size-5" />
              生成大纲
            </Button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["总字数", `${totalWords.toLocaleString()} 字`],
          ["章节数", `${novel.chapters.length} 章`],
          ["创建时间", novel.createdAt ? relativeTime(novel.createdAt) : "未知"],
          ["最后更新", relativeTime(novel.updatedAt)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-lg border border-border bg-card/40 p-4"
          >
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-lg font-semibold tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {novel.targetWordCount && (
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">写作进度</span>
            <span className="text-muted-foreground">
              {totalWords.toLocaleString()} / {novel.targetWordCount.toLocaleString()} 字
              （{Math.min(100, Math.round((totalWords / novel.targetWordCount) * 100))}%）
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (totalWords / novel.targetWordCount) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "编辑基本信息", section: "basic" },
          { label: "大纲生成", section: "outline" },
          { label: "章节概览", section: "chapters" },
        ].map(({ label, section }) => (
          <button
            key={section}
            onClick={() => onNavigate(section)}
            className="rounded-lg border border-border bg-card/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground text-left"
          >
            {label} →
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Section: 基本信息 ─────────────────────────────────────────────────────
function SectionBasicInfo({
  novel,
  patch,
}: {
  novel: Novel
  patch: (updater: (n: Novel) => Partial<Novel>) => void
}) {
  const [local, setLocal] = useState({
    title: novel.title,
    synopsis: novel.synopsis,
    targetWordCount: novel.targetWordCount ?? "",
  })
  const [genreTags, setGenreTags] = useState(() => parseGenres(novel.genre))
  const [perspectiveTags, setPerspectiveTags] = useState(() =>
    parseGenres(novel.narrativePerspective ?? ""),
  )
  const [toneTags, setToneTags] = useState(() => parseGenres(novel.storyTone ?? ""))
  const [pacingTags, setPacingTags] = useState(() => parseGenres(novel.plotPacing ?? ""))
  const [romanceTags, setRomanceTags] = useState(() => parseGenres(novel.romanceLine ?? ""))
  const [conflictTags, setConflictTags] = useState(() => parseGenres(novel.conflictType ?? ""))
  const [advancedOpen, setAdvancedOpen] = useState(false)

  useEffect(() => {
    setLocal({
      title: novel.title,
      synopsis: novel.synopsis,
      targetWordCount: novel.targetWordCount ?? "",
    })
    setGenreTags(parseGenres(novel.genre))
    setPerspectiveTags(parseGenres(novel.narrativePerspective ?? ""))
    setToneTags(parseGenres(novel.storyTone ?? ""))
    setPacingTags(parseGenres(novel.plotPacing ?? ""))
    setRomanceTags(parseGenres(novel.romanceLine ?? ""))
    setConflictTags(parseGenres(novel.conflictType ?? ""))
  }, [
    novel.id,
    novel.title,
    novel.genre,
    novel.synopsis,
    novel.targetWordCount,
    novel.narrativePerspective,
    novel.storyTone,
    novel.plotPacing,
    novel.romanceLine,
    novel.conflictType,
  ])

  function save() {
    patch(() => ({
      title: local.title || novel.title,
      genre: formatGenres(genreTags) || novel.genre,
      synopsis: local.synopsis,
      targetWordCount: local.targetWordCount ? Number(local.targetWordCount) : undefined,
      narrativePerspective: formatGenres(perspectiveTags) || undefined,
      storyTone: formatGenres(toneTags) || undefined,
      plotPacing: formatGenres(pacingTags) || undefined,
      romanceLine: formatGenres(romanceTags) || undefined,
      conflictType: formatGenres(conflictTags) || undefined,
    }))
  }

  const formData = useMemo(
    () => ({
      title: local.title,
      synopsis: local.synopsis,
      targetWordCount: local.targetWordCount,
      genreTags,
      perspectiveTags,
      toneTags,
      pacingTags,
      romanceTags,
      conflictTags,
    }),
    [
      local.title,
      local.synopsis,
      local.targetWordCount,
      genreTags,
      perspectiveTags,
      toneTags,
      pacingTags,
      romanceTags,
      conflictTags,
    ],
  )

  const completenessDisplay = useMemo(() => {
    const result = calcBasicInfoCompleteness(formData)
    return getBasicInfoCompletenessDisplay(result)
  }, [formData])

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <SectionCompletenessBar title="资料完整度" {...completenessDisplay} />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">书名</label>
          <Input value={local.title}
            onChange={(e) => setLocal((s) => ({ ...s, title: e.target.value }))}
            onBlur={save} placeholder="小说书名" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">类型 / 题材</label>
          <NovelGenrePicker
            value={genreTags}
            onChange={(tags) => {
              setGenreTags(tags)
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">简介</label>
          <Textarea value={local.synopsis}
            onChange={(e) => setLocal((s) => ({ ...s, synopsis: e.target.value }))}
            onBlur={save} placeholder="用几句话概括你的故事……"
            rows={4} className="resize-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">目标字数</label>
          <Input type="number" value={local.targetWordCount}
            onChange={(e) => setLocal((s) => ({ ...s, targetWordCount: e.target.value }))}
            onBlur={save} placeholder="全书目标字数（可选）" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">叙事视角</label>
          <PresetTagPicker
            id="novel-perspective"
            presets={NARRATIVE_PERSPECTIVES}
            value={perspectiveTags}
            onChange={setPerspectiveTags}
            single
            placeholder="如：第三人称有限视角（跟随主角）"
            description="明确第一人称或第三人称有限，避免生成时人称混乱"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">故事基调</label>
          <PresetTagPicker
            id="novel-tone"
            presets={STORY_TONES}
            value={toneTags}
            onChange={setToneTags}
            placeholder="输入自定义基调"
            description="建议 2–3 个形容词，如热血、治愈、悬疑"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">剧情节奏</label>
          <PresetTagPicker
            id="novel-pacing"
            presets={PLOT_PACINGS}
            value={pacingTags}
            onChange={setPacingTags}
            single
            placeholder="如：中等偏快，每章都有小高潮"
            description="简明描述节奏，如「快节奏爽文，每章有冲突」"
          />
        </div>
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50">
            <ChevronDown className={cn("size-4 shrink-0 transition-transform", !advancedOpen && "-rotate-90")} />
            高级配置（可选）
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-5 pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">感情线设置</label>
              <PresetTagPicker
                id="novel-romance"
                presets={ROMANCE_LINE_PRESETS}
                value={romanceTags}
                onChange={setRomanceTags}
                placeholder="如：单主线（与师妹苏瑶），慢热型"
                description="写清单/多线/无，及感情发展速度"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">主要冲突类型</label>
              <PresetTagPicker
                id="novel-conflict"
                presets={CONFLICT_TYPE_PRESETS}
                value={conflictTags}
                onChange={setConflictTags}
                placeholder="输入自定义冲突类型"
                description="可选多个，预览时用 + 连接"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <Button onClick={save} className="self-start">保存信息</Button>
    </div>
  )
}

// ── Section: 大纲生成 ─────────────────────────────────────────────────────
type GeneratedChapter = MockChapter & { expanded: boolean }

function SectionOutlineGen({
  novel,
  models,
  novelId,
  patch,
  onApply,
}: {
  novel: Novel
  models: ModelConfig[]
  novelId: string
  patch: (updater: (n: Novel) => Partial<Novel>) => void
  onApply: (chapters: MockChapter[]) => void
}) {
  const { getPromptEntriesForNovel } = useStore()
  const [chapterCount, setChapterCount] = useState(10)
  const [actsPerChapter, setActsPerChapter] = useState(3)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<GeneratedChapter[]>([])
  const [aiParamsOpen, setAiParamsOpen] = useState(true)
  const [promptSelectOpen, setPromptSelectOpen] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [promptOverrides, setPromptOverrides] = useState<Record<string, boolean>>({})

  const outlineAIConfig = novel.outlineAIConfig ?? DEFAULT_OUTLINE_AI_CONFIG
  const promptEntries = getPromptEntriesForNovel(novelId)

  function getPromptActive(entryId: string, defaultActive: boolean) {
    return entryId in promptOverrides ? promptOverrides[entryId] : defaultActive
  }

  const activeEntryIds = promptEntries
    .filter((e) => getPromptActive(e.id, e.active))
    .map((e) => e.id)

  function handleGenerate() {
    setGenerating(true)
    setProgress(0)
    setResult([])
    const total = chapterCount
    let done = 0
    const interval = setInterval(() => {
      done++
      setProgress(done)
      if (done >= total) {
        clearInterval(interval)
        setGenerating(false)
        setResult(buildMockOutline(novel, total, actsPerChapter).map((c) => ({ ...c, expanded: false })))
      }
    }, 200)
  }

  return (
    <div className="flex flex-col gap-6">
      <Collapsible open={aiParamsOpen} onOpenChange={setAiParamsOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-3 text-sm font-medium hover:bg-card/60">
          <ChevronDown className={cn("size-4 transition-transform", !aiParamsOpen && "-rotate-90")} />
          大纲 AI 参数
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="rounded-lg border border-border bg-card/40 p-4">
            <NovelAIConfigForm
              config={outlineAIConfig}
              models={models}
              onChange={(p) =>
                patch(() => ({
                  outlineAIConfig: { ...outlineAIConfig, ...p },
                }))
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={promptSelectOpen} onOpenChange={setPromptSelectOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-3 text-sm font-medium hover:bg-card/60">
          <ChevronDown className={cn("size-4 transition-transform", !promptSelectOpen && "-rotate-90")} />
          词条选择
          <Badge variant="secondary" className="ml-auto text-xs">
            {activeEntryIds.length}/{promptEntries.length} 已启用
          </Badge>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <PromptEntriesPanel
            novelId={novelId}
            showScopeFilter={false}
            overrideMode
            overrideStates={promptOverrides}
            onOverrideChange={(entryId, active) =>
              setPromptOverrides((prev) => ({ ...prev, [entryId]: active }))
            }
          />
        </CollapsibleContent>
      </Collapsible>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card/40 p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">生成章节数</label>
          <Input
            type="number"
            min={1}
            max={100}
            value={chapterCount}
            onChange={(e) =>
              setChapterCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
            }
            className="h-8 w-24 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">每章幕数</label>
          <Input
            type="number"
            min={1}
            max={10}
            value={actsPerChapter}
            onChange={(e) =>
              setActsPerChapter(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))
            }
            className="h-8 w-24 text-sm"
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" />
            预览完整提示词
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className={cn(
              "!bg-[linear-gradient(135deg,#8b5cf6_0%,#06b6d4_100%)]",
              "shadow-[0_0_20px_rgba(139,92,246,0.35)]",
              "hover:!bg-[linear-gradient(135deg,#9333ea_0%,#0891b2_100%)]",
              "hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]",
              "text-white border-0",
            )}
          >
            {generating ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                生成中…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                生成大纲
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        将基于小说简介、提示词词条、世界观词条自动生成章节结构
      </p>

      {generating && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: Math.min(progress + 1, chapterCount) }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-12 rounded-lg border border-border bg-muted/40",
                i === progress && "animate-pulse",
              )}
            />
          ))}
          <p className="text-xs text-muted-foreground">
            已生成 {progress} / {chapterCount} 章……
          </p>
        </div>
      )}

      {result.length > 0 && !generating && (
        <div className="flex flex-col gap-3">
          {result.map((chapter, ci) => (
            <Collapsible
              key={ci}
              open={chapter.expanded}
              onOpenChange={(open) =>
                setResult((prev) => prev.map((c, i) => (i === ci ? { ...c, expanded: open } : c)))
              }
            >
              <div className="rounded-lg border border-border bg-card/40">
                <div className="flex items-center gap-3 px-4 py-3">
                  <CollapsibleTrigger render={<button className="flex flex-1 items-center gap-2 text-left" />}>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        !chapter.expanded && "-rotate-90",
                      )}
                    />
                    <span className="text-sm font-medium">{chapter.title}</span>
                    <Badge variant="outline" className="ml-1 text-xs">
                      {chapter.acts.length} 幕
                    </Badge>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-xs text-muted-foreground"
                    onClick={() =>
                      setResult((prev) =>
                        prev.map((c, i) =>
                          i === ci
                            ? { ...buildMockOutline(novel, 1, c.acts.length)[0], expanded: c.expanded }
                            : c,
                        ),
                      )
                    }
                  >
                    <RefreshCw className="size-3" />
                    重新生成
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="flex flex-col gap-3 border-t border-border px-4 py-3">
                    <Textarea
                      value={chapter.summary}
                      onChange={(e) =>
                        setResult((prev) =>
                          prev.map((c, i) => (i === ci ? { ...c, summary: e.target.value } : c)),
                        )
                      }
                      rows={2}
                      className="resize-none text-sm"
                      placeholder="章节概要……"
                    />
                    <div className="flex flex-col gap-2">
                      {chapter.acts.map((act, ai) => (
                        <div key={ai} className="flex items-start gap-3">
                          <span className="mt-2 shrink-0 text-xs tabular-nums text-muted-foreground">
                            第 {ai + 1} 幕
                          </span>
                          <Textarea
                            value={act.outline}
                            onChange={(e) =>
                              setResult((prev) =>
                                prev.map((c, i) =>
                                  i === ci
                                    ? {
                                        ...c,
                                        acts: c.acts.map((a, j) =>
                                          j === ai ? { outline: e.target.value } : a,
                                        ),
                                      }
                                    : c,
                                ),
                              )
                            }
                            rows={2}
                            className="flex-1 resize-none text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
          <Button className="mt-2 w-full" onClick={() => onApply(result)}>
            <Sparkles />
            应用到编辑器
          </Button>
        </div>
      )}

      <PromptPreviewSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        novelId={novelId}
        mode="outline"
        activeEntryIds={activeEntryIds}
        chapterCount={chapterCount}
        actsPerChapter={actsPerChapter}
      />
    </div>
  )
}

// ── Section: 章节概览 ─────────────────────────────────────────────────────
function SectionChapterOverview({
  novel,
  novelId,
  models,
  patch,
}: {
  novel: Novel
  novelId: string
  models: ModelConfig[]
  patch: (updater: (n: Novel) => Partial<Novel>) => void
}) {
  const router = useRouter()
  const [contentConfigOpen, setContentConfigOpen] = useState(false)
  const contentAIConfig = novel.contentAIConfig ?? DEFAULT_CONTENT_AI_CONFIG
  const total = novel.chapters.reduce((s, c) => s + chapterWordCount(c), 0)

  return (
    <div className="flex flex-col gap-4">
      <Collapsible open={contentConfigOpen} onOpenChange={setContentConfigOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-3 text-sm font-medium hover:bg-card/60">
          <ChevronDown
            className={cn("size-4 transition-transform", !contentConfigOpen && "-rotate-90")}
          />
          正文生成默认配置
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="rounded-lg border border-border bg-card/40 p-4">
            <NovelAIConfigForm
              config={contentAIConfig}
              models={models}
              onChange={(p) =>
                patch(() => ({
                  contentAIConfig: { ...contentAIConfig, ...p },
                }))
              }
              hint="新建幕时自动继承此配置，幕级别可单独覆盖"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span className="w-5" /><span>章节标题</span>
          <span className="w-16 text-center">幕数</span>
          <span className="w-20 text-right">字数</span>
          <span className="w-16 text-right">状态</span>
        </div>
        {novel.chapters.map((chapter) => {
          const words = chapterWordCount(chapter)
          const isDone = words > 0 && chapter.acts.every((a) => a.content.trim().length > 50)
          return (
            <button key={chapter.id}
              onClick={() => router.push(`/editor/${novelId}?chapter=${chapter.id}`)}
              className="grid w-full grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-border/50 px-4 py-3 text-left last:border-0 transition-colors hover:bg-muted/40">
              <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
              <div className="min-w-0">
                <span className="block truncate text-sm">{chapter.title}</span>
                {chapter.outline && <span className="block truncate text-xs text-muted-foreground">{chapter.outline}</span>}
              </div>
              <span className="w-16 text-center text-sm tabular-nums text-muted-foreground">{chapter.acts.length} 幕</span>
              <span className="w-20 text-right text-sm tabular-nums text-muted-foreground">{words.toLocaleString()} 字</span>
              <div className="w-16 flex justify-end">
                <Badge variant={isDone ? "default" : "outline"}
                  className={cn("text-xs", isDone && "border-0 bg-emerald-500/15 text-emerald-600")}>
                  {isDone ? "完成" : "草稿"}
                </Badge>
              </div>
            </button>
          )
        })}
      </div>
      <div className="flex justify-end text-sm text-muted-foreground">
        共 <span className="mx-1 font-medium text-foreground">{novel.chapters.length}</span> 章 ·
        合计 <span className="ml-1 font-medium text-foreground">{total.toLocaleString()}</span> 字
      </div>
    </div>
  )
}

// ── Section: 导出 ─────────────────────────────────────────────────────────
function SectionExport({ novel }: { novel: Novel }) {
  function downloadTxt() {
    const lines: string[] = [`${novel.title}\n`, `${novel.synopsis}\n\n`]
    for (const chapter of novel.chapters) {
      lines.push(`\n== ${chapter.title} ==\n`)
      for (let i = 0; i < chapter.acts.length; i++) {
        const act = chapter.acts[i]
        if (act.content) lines.push(`\n【第 ${i + 1} 幕】\n${act.content}\n`)
      }
    }
    const blob = new Blob([lines.join("")], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `${novel.title}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>导出为 TXT</CardTitle>
              <CardDescription className="mt-0.5 text-xs">纯文本格式，所有章节合并</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent><p className="text-xs text-muted-foreground">将全书内容导出为 UTF-8 编码的纯文本文件，包含章节标题与正文。</p></CardContent>
        <div className="px-4 pb-4">
          <Button variant="outline" className="w-full" onClick={downloadTxt}>
            <Download />下载 TXT
          </Button>
        </div>
      </Card>

      <Card className="opacity-70">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>导出为 DOCX</CardTitle>
                <Badge variant="secondary" className="text-[10px]">开发中</Badge>
              </div>
              <CardDescription className="mt-0.5 text-xs">格式化 Word 文档</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent><p className="text-xs text-muted-foreground">支持标题样式、页码、封面页等格式化排版，适合投稿或打印。</p></CardContent>
        <div className="px-4 pb-4">
          <Tooltip>
            <TooltipTrigger render={<span className="block w-full" />}>
              <Button variant="outline" className="w-full" disabled>
                <Download />下载 DOCX
              </Button>
            </TooltipTrigger>
            <TooltipContent>即将推出</TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </div>
  )
}

// ── Section: 占位页面 ──────────────────────────────────────────────────────
function SectionPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <div className="p-4 rounded-2xl bg-muted">
        <Icon className="size-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground text-sm text-center max-w-sm">{description}</p>
      <Badge variant="outline" className="text-xs">即将推出</Badge>
    </div>
  )
}
