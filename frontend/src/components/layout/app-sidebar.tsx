"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Feather,
  Globe,
  Info,
  LayoutDashboard,
  List,
  Settings,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ── Nav item definitions ───────────────────────────────────────────────────

const HOME_NAV = [
  { key: "bookshelf", label: "我的书架", icon: BookOpen, href: "/" },
  { key: "settings", label: "设置", icon: Settings, href: "/settings" },
]

const NOVEL_NAV = [
  { key: "overview", label: "总览", icon: LayoutDashboard },
  { key: "basic", label: "基本信息", icon: Info },
  { key: "writing", label: "写作配置", icon: SlidersHorizontal },
  { key: "outline", label: "大纲生成", icon: Sparkles },
  { key: "chapters", label: "章节概览", icon: List },
  { key: "encyclopedia", label: "世界词条", icon: Globe },
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
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar overflow-hidden">
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 pt-6 pb-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Feather className="size-4.5" />
        </span>
        <span className="text-base font-semibold tracking-tight">神笔马良</span>
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
      <nav className="flex flex-col gap-0.5 p-2 pt-3">
        {HOME_NAV.map(({ key, label, icon: Icon, href }) => {
          const isActive = activeItem === key
          return (
            <button
              key={key}
              onClick={() => router.push(href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>
      <div className="flex-1" />
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
      <nav className="flex flex-col gap-0.5 p-2 pt-3 flex-1">
        {NOVEL_NAV.map(({ key, label, icon: Icon }, index) => {
          const delay = index * 40
          const isActive = activeItem === key
          return (
            <button
              key={key}
              onClick={() => onNavigate?.(key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(-16px)",
                transition: `opacity 280ms ease-out ${delay}ms, transform 280ms ease-out ${delay}ms`,
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
          <button
            onClick={() => router.push("/")}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <BookOpen className="size-4 shrink-0" />
            我的书架
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <Settings className="size-4 shrink-0" />
            设置
          </button>
        </nav>
      </div>
    </>
  )
}
