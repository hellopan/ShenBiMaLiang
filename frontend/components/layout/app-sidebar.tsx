"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart2,
  BookOpen,
  CalendarRange,
  Feather,
  GitFork,
  Globe,
  Info,
  LayoutDashboard,
  Lightbulb,
  List,
  ScrollText,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ── Nav item definitions ───────────────────────────────────────────────────

const HOME_NAV = [
  { key: "bookshelf", label: "我的书架", icon: BookOpen, href: "/" },
  { key: "inspiration", label: "灵感片段", icon: Lightbulb, href: "/inspiration" },
  { key: "stats", label: "统计分析", icon: BarChart2, href: "/stats" },
  { key: "logs", label: "请求日志", icon: ScrollText, href: "/logs" },
  { key: "about", label: "关于", icon: Info, href: "/about" },
  { key: "settings", label: "设置", icon: Settings, href: "/settings" },
]

const NOVEL_NAV_TOP = [
  { key: "overview", label: "总览", icon: LayoutDashboard },
  { key: "basic", label: "基本信息", icon: Info },
  { key: "writing", label: "写作配置", icon: SlidersHorizontal },
  { key: "outline", label: "大纲生成", icon: Sparkles },
  { key: "chapters", label: "章节概览", icon: List },
  { key: "encyclopedia", label: "世界词条", icon: Globe },
]

const NOVEL_NAV_EXTRA = [
  { key: "characters", label: "人物关系图", icon: GitFork },
  { key: "timeline", label: "时间线", icon: CalendarRange },
  { key: "character-status", label: "人物状态", icon: Users },
]

const NOVEL_BOTTOM_NAV = [
  { key: "bookshelf", label: "我的书架", icon: BookOpen, href: "/" },
  { key: "inspiration", label: "灵感片段", icon: Lightbulb, href: "/inspiration" },
  { key: "stats", label: "统计分析", icon: BarChart2, href: "/stats" },
  { key: "logs", label: "请求日志", icon: ScrollText, href: "/logs" },
  { key: "about", label: "关于", icon: Info, href: "/about" },
  { key: "settings", label: "设置", icon: Settings, href: "/settings" },
]

// ── Types ─────────────────────────────────────────────────────────────────

interface AppSidebarProps {
  mode: "home" | "novel"
  activeItem?: string
  novelId?: string
  novelTitle?: string
  onNavigate?: (section: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────

export function AppSidebar({
  mode,
  activeItem,
  novelId,
  novelTitle,
  onNavigate,
}: AppSidebarProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Tiny delay so browser paints the initial state before the transition fires
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <aside
      className="flex w-60 shrink-0 flex-col overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.10)",
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 pt-6 pb-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-indigo-500/30">
          <Feather className="size-4.5" />
        </span>
        <span className="text-base font-semibold tracking-tight text-white">神笔马良</span>
      </div>

      <Separator />

      {mode === "novel" ? (
        <NovelSidebar
          activeItem={activeItem}
          onNavigate={onNavigate}
          mounted={mounted}
        />
      ) : (
        <HomeSidebar activeItem={activeItem} mounted={mounted} />
      )}
    </aside>
  )
}

// ── Home sidebar ──────────────────────────────────────────────────────────

function HomeSidebar({
  activeItem,
  mounted,
}: {
  activeItem?: string
  mounted: boolean
}) {
  const router = useRouter()

  return (
    <>
      <nav className="flex flex-col gap-0.5 p-2 pt-3 flex-1">
        {HOME_NAV.map(({ key, label, icon: Icon, href }) => {
          const isActive = activeItem === key
          return (
            <button
              key={key}
              onClick={() => router.push(href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "bg-indigo-500/20 text-indigo-300 font-medium"
                  : "text-white/60 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>
    </>
  )
}

// ── Novel sidebar ─────────────────────────────────────────────────────────

function NovelSidebar({
  activeItem,
  onNavigate,
  mounted,
}: {
  activeItem?: string
  onNavigate?: (section: string) => void
  mounted: boolean
}) {
  const router = useRouter()

  return (
    <>
      {/* Novel nav items — staggered entrance */}
      <nav className="flex flex-col gap-0.5 p-2 pt-3 flex-1 overflow-y-auto">
        {NOVEL_NAV_TOP.map(({ key, label, icon: Icon }, index) => {
          const delay = index * 40
          const isActive = activeItem === key
          return (
            <button
              key={key}
              onClick={() => onNavigate?.(key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm",
                isActive
                  ? "bg-indigo-500/20 text-indigo-300 font-medium"
                  : "text-white/60 hover:bg-white/8 hover:text-white",
              )}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(-16px)",
                transition: `opacity 280ms ease-out ${delay}ms, transform 280ms ease-out ${delay}ms, background-color 200ms, color 200ms`,
              }}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          )
        })}

        <div className="px-2 py-1.5">
          <Separator />
        </div>

        {NOVEL_NAV_EXTRA.map(({ key, label, icon: Icon }, index) => {
          const delay = (NOVEL_NAV_TOP.length + index) * 40
          const isActive = activeItem === key
          return (
            <button
              key={key}
              onClick={() => onNavigate?.(key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm",
                isActive
                  ? "bg-indigo-500/20 text-indigo-300 font-medium"
                  : "text-white/60 hover:bg-white/8 hover:text-white",
              )}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(-16px)",
                transition: `opacity 280ms ease-out ${delay}ms, transform 280ms ease-out ${delay}ms, background-color 200ms, color 200ms`,
              }}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Bottom nav — fade + slight slide */}
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 260ms ease-out 220ms, transform 260ms ease-out 220ms",
        }}
      >
        <Separator />
        <nav className="flex flex-col gap-0.5 p-2 pb-3">
          {NOVEL_BOTTOM_NAV.map(({ key, label, icon: Icon, href }) => (
            <button
              key={key}
              onClick={() => router.push(href)}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-white/50 transition-all duration-200 hover:bg-white/8 hover:text-white"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
