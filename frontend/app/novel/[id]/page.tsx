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

const GENRE_CHAPTER_TEMPLATES: Record<string, Array<{ title: string; summary: string }>> = {
  玄幻修真: [
    { title: "序章·灵根觉醒", summary: "主角在平凡的劳作中意外引动体内沉眠的灵脉，命运就此改变。" },
    { title: "踏入修行之路", summary: "主角带着刚觉醒的力量下山，拜入宗门，接触到广阔的修行世界。" },
    { title: "宗门磨砺", summary: "面对世家子弟的打压，主角在修炼资源匮乏中摸索出属于自己的道路。" },
    { title: "险境历练", summary: "踏入危机四伏的禁地，主角在与妖兽的搏杀中悟出新的功法境界。" },
    { title: "秘境机缘", summary: "偶然闯入上古遗迹，获得改变命运的传承，但也引来了强大敌人的觊觎。" },
    { title: "仇敌浮现", summary: "隐藏于幕后的敌手现身，陈年旧怨与新仇交织，主角陷入险境。" },
    { title: "渡劫突破", summary: "历经重重磨砺，主角在生死关头强行突破，功法晋升至新的境界。" },
    { title: "天地大势", summary: "一场波及整个修行界的风暴酝酿成型，主角站在了命运的漩涡中央。" },
    { title: "巅峰决战", summary: "与宿命之敌展开最终对决，残剑剑意与万载阴谋在此刻全部爆发。" },
    { title: "星河之巅", summary: "一切尘埃落定，主角站在曾经仰望的高峰，俯瞰脚下浩瀚星河。" },
  ],
  悬疑推理: [
    { title: "雾中来客", summary: "一桩令人不安的委托出现在侦探眼前，表面平静的故事里隐藏着血腥的开端。" },
    { title: "第一条线索", summary: "案件现场留下了刻意伪造的痕迹，侦探意识到这背后有人在操控全局。" },
    { title: "人物关系网", summary: "随着调查深入，嫌疑人的关系网络越来越复杂，每个人都有不可告人的秘密。" },
    { title: "虚假的真相", summary: "一个看似完美的解释浮出水面，但侦探的直觉告诉他这只是精心设计的烟雾弹。" },
    { title: "危险逼近", summary: "侦探发现自己已经被列入了某人的死亡名单，追凶者与被追者的身份开始颠倒。" },
    { title: "真凶现形", summary: "所有碎片拼在一起，一个令人震惊的真相浮出水面，真凶就在最意想不到的地方。" },
    { title: "最后的对决", summary: "在浓雾最深处，侦探与真凶展开了一场智慧与意志的最终较量。" },
    { title: "迷雾散去", summary: "案件告破，但真相比所有人预想的都更令人心寒，有些伤口永远无法愈合。" },
  ],
  科幻太空: [
    { title: "苏醒", summary: "三百年后，方舟上的幸存者从冷冻休眠中醒来，发现飞船已偏离了既定航线。" },
    { title: "异常信号", summary: "导航AI发出了从未出现过的行为模式，有人开始怀疑它正在产生自我意识。" },
    { title: "分裂", summary: "关于是否信任AI的争论将幸存者分成了两个对立阵营，紧张气氛在密闭空间内蔓延。" },
    { title: "深空遭遇", summary: "飞船探测到了前所未见的信号源，可能是外星文明，也可能是毁灭的预兆。" },
    { title: "系统崩溃", summary: "一系列看似随机的故障接连发生，飞船陷入危机，有人开始怀疑这是蓄意破坏。" },
    { title: "AI的选择", summary: "导航AI面临一个关键抉择，它的决定将决定飞船上所有人的命运。" },
    { title: "最后的航程", summary: "在遥远的深空，人类与人工智能之间展开了一场关于信任与背叛的终极试验。" },
    { title: "新纪元", summary: "抵达目的地，一个崭新的文明即将诞生，但这一切的代价，究竟是否值得？" },
  ],
}

const DEFAULT_CHAPTER_TEMPLATES = [
  { title: "序章·开端", summary: "主角平静的生活被突如其来的变故打破，命运之轮开始转动。" },
  { title: "初入险境", summary: "主角遭遇第一个重大挑战，在困境中展现出超越常人的潜质。" },
  { title: "意外机缘", summary: "无意中得到一件关键物品或掌握某种特殊能力，改变了处境。" },
  { title: "强敌降临", summary: "一个强大的对手出现，双方第一次正面交锋，主角处于劣势。" },
  { title: "秘密揭露", summary: "隐藏已久的秘密浮出水面，主角对世界的认知产生了根本动摇。" },
  { title: "艰难抉择", summary: "面临两难困境，每条路都意味着巨大的代价，主角不得不做出选择。" },
  { title: "绝境反转", summary: "在最危急的时刻，主角发挥出潜藏的力量，完成了惊天逆转。" },
  { title: "心境蜕变", summary: "经历一系列磨砺之后，主角的心境发生了质的变化，更加成熟。" },
  { title: "终极对决", summary: "与最大的敌人展开决战，所有伏笔在这一章集中爆发。" },
  { title: "尘埃落定", summary: "一切归于平静，主角站在新的起点，新的旅程即将开始。" },
]

const GENRE_ACT_TEMPLATES: Record<string, string[]> = {
  玄幻修真: [
    "铺垫：交代修行境界与所在环境",
    "冲突：与对手或天地异象正面交锋",
    "高潮：灵脉突破或功法顿悟",
    "转折：意想不到的人物或秘密出现",
    "收束：为下一幕埋下伏笔",
  ],
  悬疑推理: [
    "场景：雾中现场的第一印象",
    "线索：发现矛盾细节，展开推理",
    "转折：表象背后的隐藏逻辑",
    "危机：侦探陷入危险或困境",
    "收束：新的疑团浮现，引向下一章",
  ],
  科幻太空: [
    "环境：深空的孤寂与科技感",
    "冲突：人与AI或人与人之间的对立",
    "发现：未知信号或异常数据",
    "危机：系统故障或外部威胁",
    "收束：决策后果显现，留下悬念",
  ],
}

const DEFAULT_ACT_TEMPLATES = [
  "铺垫与引入，交代时间、地点和人物状态",
  "事件发展，矛盾逐步激化",
  "高潮冲突，情节推至顶点",
  "转折点出现，形势发生变化",
  "尾声与收束，为下一章做好铺垫",
]

function buildMockOutline(
  novel: Novel,
  chapterCount: number,
  actsPerChapter: number,
): MockChapter[] {
  const chapterTemplates =
    GENRE_CHAPTER_TEMPLATES[novel.genre] ?? DEFAULT_CHAPTER_TEMPLATES
  const actTemplates = GENRE_ACT_TEMPLATES[novel.genre] ?? DEFAULT_ACT_TEMPLATES
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
