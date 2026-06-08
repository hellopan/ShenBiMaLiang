"use client"

import { useState } from "react"
import { Plus, BookMarked, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { AppLogo } from "@/components/app-logo"
import { NovelCard } from "@/components/novel-card"
import { NewNovelDialog } from "@/components/new-novel-dialog"
import { useStore } from "@/lib/store"

export default function HomePage() {
  const { novels, createNovel, deleteNovel } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <AppLogo />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
              aria-label="设置"
            >
              <Settings />
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus data-icon="inline-start" />
              新建小说
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">我的书架</h1>
          <p className="text-sm text-muted-foreground">
            共 {novels.length} 部作品 · 继续你的创作
          </p>
        </div>

        {novels.length === 0 ? (
          <Empty className="rounded-xl border border-dashed border-border py-20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookMarked />
              </EmptyMedia>
              <EmptyTitle>书架空空如也</EmptyTitle>
              <EmptyDescription>
                还没有任何作品，点击下方按钮创建你的第一部小说吧。
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus data-icon="inline-start" />
              新建小说
            </Button>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} onDelete={deleteNovel} />
            ))}
          </div>
        )}
      </main>

      <NewNovelDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={createNovel} />
    </div>
  )
}
