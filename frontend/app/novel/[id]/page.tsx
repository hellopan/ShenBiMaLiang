"use client"

import React, { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import {
  BookOpen,
  CalendarRange,
  ChevronDown,
  Download,
  FileText,
  GitFork,
  GripVertical,
  PenLine,
  RefreshCw,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { EncyclopediaPanel } from "@/components/encyclopedia/encyclopedia-panel"
import { useStore, uid } from "@/lib/store"
import {
  type Novel,
  type OutlineGenConfig,
  type ModelConfig,
  DEFAULT_OUTLINE_CONFIG,
  DEFAULT_CONTENT_CONFIG,
  novelWordCount,
  chapterWordCount,
  relativeTime,
} from "@/lib/types"
import { cn } from "@/lib/utils"

// ── Genre → gradient (reused from home page for the overview cover) ───────
const GENRE_GRADIENTS: Record<string, string> = {
  玄幻修真: "from-indigo-600 to-purple-700",
  悬疑推理: "from-slate-600 to-gray-800",
  科幻太空: "from-cyan-600 to-blue-800",
  现代都市: "from-rose-500 to-pink-700",
  历史架空: "from-amber-600 to-orange-700",
  言情: "from-pink-500 to-rose-600",
}
const DEFAULT_GRADIENT = "from-violet-600 to-indigo-700"
function getGradient(genre: string) {
  return GENRE_GRADIENTS[genre] ?? DEFAULT_GRADIENT
}

// ── Section metadata ────────────────────────────────────────────────────
const SECTION_TITLES: Record<string, string> = {
  overview: "总览",
  basic: "基本信息",
  writing: "写作配置",
  outline: "大纲生成",
  chapters: "章节概览",
  encyclopedia: "世界词条",
  characters: "人物关系图",
  timeline: "时间线",
  "character-status": "人物状态",
  export: "导出",
}

// ── Mock outline data ─────────────────────────────────────────────────────
type MockAct = { outline: string }
type MockChapter = { title: string; summary: string; acts: MockAct[] }

function buildMockOutline(chapterCount: number, actsPerChapter: number): MockChapter[] {
  const templates = [
    { title: "序章·命运伊始", summary: "主角平静的生活被突如其来的变故打破，命运之轮开始转动。" },
    { title: "第一重考验", summary: "主角遭遇第一个重大挑战，在困境中展现出超越常人的潜质。" },
    { title: "意外收获", summary: "无意中得到一件神秘物品或掌握某种特殊能力，改变了处境。" },
    { title: "强敌降临", summary: "一个强大的对手出现，双方第一次正面交锋，主角处于劣势。" },
    { title: "秘密揭露", summary: "隐藏已久的秘密浮出水面，主角对世界的认知产生了根本动摇。" },
    { title: "艰难抉择", summary: "面临两难困境，每条路都意味着巨大的代价，主角不得不做出选择。" },
    { title: "绝境反转", summary: "在最危急的时刻，主角发挥出潜藏的力量，完成了惊天逆转。" },
    { title: "心境蜕变", summary: "经历了一系列磨砺之后，主角的心境发生了质的变化，更加成熟。" },
    { title: "终极对决", summary: "与最大的敌人展开决战，所有伏笔在这一章集中爆发。" },
    { title: "尘埃落定", summary: "一切归于平静，主角站在新的起点，新的旅程即将开始。" },
  ]
  const actTemplates = [
    "铺垫与引入，交代时间、地点和人物状态",
    "事件发展，矛盾逐步激化",
    "高潮冲突，情节推至顶点",
    "转折点出现，形势发生变化",
    "尾声与收束，为下一章做好铺垫",
  ]
  return Array.from({ length: chapterCount }, (_, ci) => {
    const t = templates[ci % templates.length]
    return {
      title: ci === 0 ? t.title : `第${ci + 1}章 ${t.title}`,
      summary: t.summary,
      acts: Array.from({ length: actsPerChapter }, (_, ai) => ({
        outline: actTemplates[ai % actTemplates.length],
      })),
    }
  })
}

// ── GenParams form ────────────────────────────────────────────────────────
function GenConfigForm({
  label,
  hint,
  config,
  models,
  onChange,
}: {
  label: string
  hint: string
  config: OutlineGenConfig
  models: ModelConfig[]
  onChange: (patch: Partial<OutlineGenConfig>) => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card/40 p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {models.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">模型</label>
          <Select
            value={config.modelId || models[0]?.id || ""}
            onValueChange={(v) => onChange({ modelId: v ?? undefined })}
          >
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue>
                {() =>
                  models.find((m) => m.id === config.modelId)?.label ??
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
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">温度</label>
          <span className="text-xs tabular-nums">{config.temperature.toFixed(1)}</span>
        </div>
        <Slider min={0} max={2} step={0.1} value={[config.temperature]}
          onValueChange={(v) => onChange({ temperature: Array.isArray(v) ? v[0] : v })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Top P</label>
          <span className="text-xs tabular-nums">{config.topP.toFixed(2)}</span>
        </div>
        <Slider min={0} max={1} step={0.05} value={[config.topP]}
          onValueChange={(v) => onChange({ topP: Array.isArray(v) ? v[0] : v })} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-muted-foreground">Top K</label>
        <Input type="number" min={1} max={100} value={config.topK}
          onChange={(e) => onChange({ topK: parseInt(e.target.value) || 1 })}
          className="h-7 w-20 text-xs" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-muted-foreground">最大回复长度</label>
        <Input type="number" min={1000} value={config.maxReplyLength}
          onChange={(e) => onChange({ maxReplyLength: parseInt(e.target.value) || 60000 })}
          className="h-7 w-28 text-xs" />
      </div>
      <p className="text-[11px] text-muted-foreground/70">幕级别可单独覆盖此配置</p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function NovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { novels, updateNovel, models } = useStore()
  const novel = novels.find((n) => n.id === id)
  const [activeSection, setActiveSection] = useState("overview")
  const activeModels = useMemo(() => models.filter((m) => m.active), [models])

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

        <main className="relative flex flex-1 flex-col overflow-hidden">
          {/* Floating "开始创作" button */}
          <div className="pointer-events-none absolute right-6 top-6 z-10">
            <Button
              className="pointer-events-auto h-10 justify-center rounded-lg px-6 text-sm font-semibold shadow-md"
              onClick={() => router.push(`/editor/${id}`)}
            >
              <PenLine className="size-4" />
              开始创作
            </Button>
          </div>

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
              <SectionBasicInfo novel={novel} patch={patch} totalWords={totalWords} />
            )}
            {activeSection === "writing" && (
              <SectionWritingConfig novel={novel} patch={patch} models={activeModels} />
            )}
            {activeSection === "outline" && (
              <SectionOutlineGen
                novel={novel}
                models={activeModels}
                novelId={id}
                onSwitchToWriting={() => setActiveSection("writing")}
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
              <SectionChapterOverview novel={novel} novelId={id} />
            )}
            {activeSection === "encyclopedia" && <EncyclopediaPanel novelId={id} />}
            {activeSection === "characters" && <SectionPlaceholder icon={GitFork} title="人物关系图" description="可视化展示小说中角色之间的关系网络，支持自定义关系类型" />}
            {activeSection === "timeline" && <SectionPlaceholder icon={CalendarRange} title="时间线" description="梳理故事发展的时间轴，追踪关键事件节点与时间跨度" />}
            {activeSection === "character-status" && <SectionPlaceholder icon={Users} title="人物状态" description="追踪每个章节中角色的状态变化、属性成长与当前处境" />}
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
  const gradient = getGradient(novel.genre)

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
              variant="outline"
              className="h-12 justify-center rounded-xl px-8 text-base font-semibold"
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
          { label: "写作配置", section: "writing" },
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
  totalWords,
}: {
  novel: Novel
  patch: (updater: (n: Novel) => Partial<Novel>) => void
  totalWords: number
}) {
  const [local, setLocal] = useState({
    title: novel.title,
    genre: novel.genre,
    synopsis: novel.synopsis,
    targetWordCount: novel.targetWordCount ?? "",
    writingLanguage: novel.writingLanguage ?? "现代白话文",
  })

  function save() {
    patch(() => ({
      title: local.title || novel.title,
      genre: local.genre || novel.genre,
      synopsis: local.synopsis,
      targetWordCount: local.targetWordCount ? Number(local.targetWordCount) : undefined,
      writingLanguage: local.writingLanguage,
    }))
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">书名</label>
          <Input value={local.title}
            onChange={(e) => setLocal((s) => ({ ...s, title: e.target.value }))}
            onBlur={save} placeholder="小说书名" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">类型 / 题材</label>
          <Input value={local.genre}
            onChange={(e) => setLocal((s) => ({ ...s, genre: e.target.value }))}
            onBlur={save} placeholder="如：玄幻修真、悬疑推理、都市言情" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">简介</label>
          <Textarea value={local.synopsis}
            onChange={(e) => setLocal((s) => ({ ...s, synopsis: e.target.value }))}
            onBlur={save} placeholder="用几句话概括你的故事……"
            rows={4} className="resize-none" />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium">目标字数</label>
            <Input type="number" value={local.targetWordCount}
              onChange={(e) => setLocal((s) => ({ ...s, targetWordCount: e.target.value }))}
              onBlur={save} placeholder="全书目标字数（可选）" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium">写作语言风格</label>
            <Select value={local.writingLanguage}
              onValueChange={(v) => { if (v) { setLocal((s) => ({ ...s, writingLanguage: v })); patch(() => ({ writingLanguage: v })) } }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["现代白话文", "古风文言", "轻小说风格", "其他"].map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Button onClick={save} className="self-start">保存信息</Button>
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">统计数据</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["当前总字数", `${totalWords.toLocaleString()} 字`],
            ["章节数", `${novel.chapters.length} 章`],
            ["创建时间", novel.createdAt ? relativeTime(novel.createdAt) : "未知"],
            ["最后更新", relativeTime(novel.updatedAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
        {novel.targetWordCount && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>写作进度</span>
              <span>{Math.min(100, Math.round((totalWords / novel.targetWordCount) * 100))}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (totalWords / novel.targetWordCount) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Section: 写作配置 ─────────────────────────────────────────────────────
function SectionWritingConfig({
  novel, patch, models,
}: {
  novel: Novel
  patch: (updater: (n: Novel) => Partial<Novel>) => void
  models: ModelConfig[]
}) {
  const [stylePrompt, setStylePrompt] = useState(novel.stylePrompt ?? "")
  const [forbiddenPrompt, setForbiddenPrompt] = useState(novel.forbiddenPrompt ?? "")
  const outlineConfig = novel.outlineConfig ?? DEFAULT_OUTLINE_CONFIG
  const contentConfig = novel.contentConfig ?? DEFAULT_CONTENT_CONFIG

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold">内容提示词</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">全书通用的写作风格指引，AI 生成时自动引用</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">文风提示词</label>
            <Textarea value={stylePrompt} onChange={(e) => setStylePrompt(e.target.value)}
              onBlur={() => patch(() => ({ stylePrompt }))}
              placeholder="描述写作风格，如：文笔细腻，善用环境描写烘托情绪……"
              rows={4} className="resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">禁止提示词</label>
            <Textarea value={forbiddenPrompt} onChange={(e) => setForbiddenPrompt(e.target.value)}
              onBlur={() => patch(() => ({ forbiddenPrompt }))}
              placeholder="禁止出现的内容，如：禁止使用网络流行语……"
              rows={3} className="resize-none" />
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="text-sm font-semibold">默认 AI 配置</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">新建幕时自动继承正文配置；大纲生成时使用大纲配置</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <GenConfigForm label="大纲生成默认配置" hint="用于生成章节大纲"
          config={outlineConfig} models={models}
          onChange={(p) => patch(() => ({ outlineConfig: { ...outlineConfig, ...p } }))} />
        <GenConfigForm label="正文生成默认配置" hint="新建幕时自动继承"
          config={contentConfig} models={models}
          onChange={(p) => patch(() => ({ contentConfig: { ...contentConfig, ...p } }))} />
      </div>
    </div>
  )
}

// ── Section: 大纲生成 ─────────────────────────────────────────────────────
type GeneratedChapter = MockChapter & { expanded: boolean }

function SectionOutlineGen({
  novel, models, novelId, onSwitchToWriting, onApply,
}: {
  novel: Novel
  models: ModelConfig[]
  novelId: string
  onSwitchToWriting: () => void
  onApply: (chapters: MockChapter[]) => void
}) {
  const [chapterCount, setChapterCount] = useState(10)
  const [actsPerChapter, setActsPerChapter] = useState(3)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<GeneratedChapter[]>([])

  const currentModelLabel =
    models.find((m) => m.id === novel.outlineConfig?.modelId)?.label ?? models[0]?.label ?? "未配置"

  function handleGenerate() {
    setGenerating(true); setProgress(0); setResult([])
    const total = chapterCount; let done = 0
    const interval = setInterval(() => {
      done++; setProgress(done)
      if (done >= total) {
        clearInterval(interval); setGenerating(false)
        setResult(buildMockOutline(total, actsPerChapter).map((c) => ({ ...c, expanded: false })))
      }
    }, 200)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card/40 p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">生成章节数</label>
          <Input type="number" min={1} max={100} value={chapterCount}
            onChange={(e) => setChapterCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="h-8 w-24 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">每章幕数</label>
          <Input type="number" min={1} max={10} value={actsPerChapter}
            onChange={(e) => setActsPerChapter(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            className="h-8 w-24 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">使用配置</label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{currentModelLabel}</Badge>
            <button onClick={onSwitchToWriting} className="text-xs text-primary hover:underline">修改</button>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="ml-auto">
          {generating ? (<><RefreshCw className="size-4 animate-spin" />生成中…</>) : (<><Wand2 />生成大纲</>)}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">将基于小说简介、文风提示词、世界观词条自动生成章节结构</p>

      {generating && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: Math.min(progress + 1, chapterCount) }, (_, i) => (
            <div key={i} className={cn("h-12 rounded-lg border border-border bg-muted/40", i === progress && "animate-pulse")} />
          ))}
          <p className="text-xs text-muted-foreground">已生成 {progress} / {chapterCount} 章……</p>
        </div>
      )}

      {result.length > 0 && !generating && (
        <div className="flex flex-col gap-3">
          {result.map((chapter, ci) => (
            <Collapsible key={ci} open={chapter.expanded}
              onOpenChange={(open) => setResult((prev) => prev.map((c, i) => (i === ci ? { ...c, expanded: open } : c)))}>
              <div className="rounded-lg border border-border bg-card/40">
                <div className="flex items-center gap-3 px-4 py-3">
                  <CollapsibleTrigger render={<button className="flex flex-1 items-center gap-2 text-left" />}>
                    <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", !chapter.expanded && "-rotate-90")} />
                    <span className="text-sm font-medium">{chapter.title}</span>
                    <Badge variant="outline" className="ml-1 text-xs">{chapter.acts.length} 幕</Badge>
                  </CollapsibleTrigger>
                  <Button size="sm" variant="ghost" className="shrink-0 text-xs text-muted-foreground"
                    onClick={() => setResult((prev) => prev.map((c, i) => i === ci ? { ...buildMockOutline(1, c.acts.length)[0], expanded: c.expanded } : c))}>
                    <RefreshCw className="size-3" />重新生成
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="border-t border-border px-4 py-3 flex flex-col gap-3">
                    <Textarea value={chapter.summary}
                      onChange={(e) => setResult((prev) => prev.map((c, i) => i === ci ? { ...c, summary: e.target.value } : c))}
                      rows={2} className="resize-none text-sm" placeholder="章节概要……" />
                    <div className="flex flex-col gap-2">
                      {chapter.acts.map((act, ai) => (
                        <div key={ai} className="flex items-start gap-3">
                          <span className="mt-2 shrink-0 text-xs tabular-nums text-muted-foreground">第 {ai + 1} 幕</span>
                          <Textarea value={act.outline}
                            onChange={(e) => setResult((prev) => prev.map((c, i) => i === ci ? { ...c, acts: c.acts.map((a, j) => j === ai ? { outline: e.target.value } : a) } : c))}
                            rows={2} className="flex-1 resize-none text-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
          <Button className="mt-2 w-full" onClick={() => onApply(result)}>
            <Sparkles />应用到编辑器
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Section: 章节概览 ─────────────────────────────────────────────────────
function SectionChapterOverview({ novel, novelId }: { novel: Novel; novelId: string }) {
  const router = useRouter()
  const total = novel.chapters.reduce((s, c) => s + chapterWordCount(c), 0)

  return (
    <div className="flex flex-col gap-4">
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
