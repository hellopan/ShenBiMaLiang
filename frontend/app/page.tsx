"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { NewNovelDialog } from "@/components/new-novel-dialog"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { useStore } from "@/lib/store"
import { type Novel, novelWordCount, relativeTime } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getGenreGradient } from "@/lib/genres"

// ── Home page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const { novels, createNovel, deleteNovel } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"全部" | "最近更新">("全部")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = novels
    if (q) {
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.genre.toLowerCase().includes(q))
    }
    if (filter === "最近更新") {
      list = [...list].sort((a, b) => b.updatedAt - a.updatedAt)
    }
    return list
  }, [novels, query, filter])

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AppSidebar mode="home" activeItem="bookshelf" />

      {/* ── Right content area ───────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-bold tracking-tight">我的小说</h1>
            <p className="text-sm text-muted-foreground">共 {novels.length} 部作品</p>
          </div>
          <div className="flex items-center gap-3">
            {/* New novel button */}
            <Button onClick={() => setDialogOpen(true)}>
              <Plus data-icon="inline-start" />
              新建小说
            </Button>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索书名…"
                className="h-9 w-48 pl-9 text-sm"
              />
            </div>
            {/* Filter tabs */}
            <div className="flex items-center gap-0.5 rounded-lg p-[3px]" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
              {(["全部", "最近更新"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-all",
                    filter === f
                      ? "bg-indigo-500/30 text-white shadow-sm"
                      : "text-white/50 hover:text-white",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Novel list */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {filtered.length === 0 ? (
            novels.length === 0 ? (
              <Empty className="mt-16 rounded-xl border border-dashed border-border py-20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BookOpen />
                  </EmptyMedia>
                  <EmptyTitle>书架空空如也</EmptyTitle>
                  <EmptyDescription>还没有任何作品，点击新建开始创作。</EmptyDescription>
                </EmptyHeader>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus data-icon="inline-start" />
                  新建小说
                </Button>
              </Empty>
            ) : (
              <p className="mt-16 text-center text-sm text-muted-foreground">没有符合搜索条件的小说</p>
            )
          ) : (
            <div className="flex flex-wrap gap-5">
              {filtered.map((novel) => (
                <NovelCard key={novel.id} novel={novel} onDelete={deleteNovel} />
              ))}
            </div>
          )}
        </div>
      </main>

      <NewNovelDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={createNovel} />
    </div>
  )
}

// ── Novel card ─────────────────────────────────────────────────────────────
function NovelCard({ novel, onDelete }: { novel: Novel; onDelete: (id: string) => void }) {
  const router = useRouter()
  const words = novelWordCount(novel)
  const gradient = getGenreGradient(novel.genre)

  return (
    <div
      className="group shrink-0 overflow-hidden rounded-xl border border-white/12 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
      style={{ width: 360, height: 500 }}
    >
      {/* Cover — fixed 380px tall */}
      <div
        className={cn("relative w-full overflow-hidden bg-gradient-to-br", gradient)}
        style={{ height: 380 }}
      >
        {/* Bottom gradient + synopsis */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-16">
          <p className="line-clamp-3 text-sm leading-relaxed text-white/90">
            {novel.synopsis || "暂无简介"}
          </p>
        </div>

        {/* Hover action overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            className="h-11 gap-2 rounded-xl px-6 text-base font-medium shadow-lg"
            onClick={() => router.push(`/novel/${novel.id}`)}
          >
            <BookOpen className="size-5" />
            打开
          </Button>
          <Button
            className="group h-11 gap-2 rounded-xl border-0 bg-red-500/80 px-6 text-base font-medium text-white shadow-lg backdrop-blur-[10px] transition-all hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            onClick={() => onDelete(novel.id)}
          >
            <Trash2 className="size-5 text-red-200 transition-colors group-hover:text-white" />
            删除
          </Button>
        </div>
      </div>

      {/* Info — fixed 120px tall */}
      <div
        className="flex flex-col justify-between p-4"
        style={{
          height: 120,
          background: 'rgba(15, 23, 41, 0.60)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <p className="truncate text-sm font-semibold leading-snug text-white">{novel.title}</p>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="px-1.5 py-0 text-[11px] border-white/20 bg-white/10 text-white/80">
            {novel.genre}
          </Badge>
          <span className="text-[11px] text-white/50">{words.toLocaleString()} 字</span>
        </div>
        <p className="text-[11px] text-white/40">{relativeTime(novel.updatedAt)}</p>
      </div>
    </div>
  )
}
