"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Plus, BookOpen, Settings, Library, Circle, SlidersHorizontal, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { type Novel, type Chapter, chapterWordCount } from "@/lib/types"
import { useStore } from "@/lib/store"

type Props = {
  novel: Novel
  activeChapterId: string
  onSelectChapter: (id: string) => void
  onToggleExpand: (id: string) => void
  onAddChapter: () => void
}

export function ChapterSidebar({
  novel,
  activeChapterId,
  onSelectChapter,
  onToggleExpand,
  onAddChapter,
}: Props) {
  const router = useRouter()
  const { updateNovel } = useStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [stylePrompt, setStylePrompt] = useState(novel.stylePrompt ?? "")
  const [forbiddenPrompt, setForbiddenPrompt] = useState(novel.forbiddenPrompt ?? "")

  function saveSettings() {
    updateNovel(novel.id, (n) => ({ ...n, stylePrompt, forbiddenPrompt }))
    setSheetOpen(false)
  }

  return (
    <>
      <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="border-b border-border px-4 py-4">
          <Link
            href={`/novel/${novel.id}`}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← 返回详情
          </Link>
          <h2 className="mt-2 truncate text-sm font-semibold" title={novel.title}>
            {novel.title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{novel.genre}</p>
        </div>

        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-0.5 p-2">
            {novel.chapters.map((chapter) => (
              <ChapterItem
                key={chapter.id}
                chapter={chapter}
                active={chapter.id === activeChapterId}
                onSelect={() => onSelectChapter(chapter.id)}
                onToggle={() => onToggleExpand(chapter.id)}
              />
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-border p-2">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onAddChapter}>
            <Plus data-icon="inline-start" />
            添加章节
          </Button>
          <div className="mt-1 flex flex-col gap-0.5">
            <Button
              variant="ghost" size="sm"
              className="w-full justify-start"
              onClick={() => {
                setStylePrompt(novel.stylePrompt ?? "")
                setForbiddenPrompt(novel.forbiddenPrompt ?? "")
                setSheetOpen(true)
              }}
            >
              <SlidersHorizontal data-icon="inline-start" />
              小说设置
            </Button>
            <Button variant="ghost" size="sm" nativeButton={false} className="w-full justify-start" render={<Link href={`/novel/${novel.id}?tab=encyclopedia`} />}>
              <Library data-icon="inline-start" />
              世界观词条
            </Button>
            <Button variant="ghost" size="sm" nativeButton={false} className="w-full justify-start" render={<Link href="/settings" />}>
              <Settings data-icon="inline-start" />
              设置
            </Button>
          </div>
        </div>
      </aside>

      {/* Settings Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>小说设置</SheetTitle>
            <SheetDescription>文风与内容提示词，全书 AI 生成时引用</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 overflow-y-auto px-5 py-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">文风提示词</label>
              <Textarea
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                placeholder="描述写作风格，如：文笔细腻，善用环境描写……"
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">禁止提示词</label>
              <Textarea
                value={forbiddenPrompt}
                onChange={(e) => setForbiddenPrompt(e.target.value)}
                placeholder="禁止出现的内容，如：禁止网络流行语……"
                rows={4}
                className="resize-none"
              />
            </div>

            <Separator />

            <button
              onClick={() => { setSheetOpen(false); router.push(`/novel/${novel.id}`) }}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline self-start"
            >
              <ExternalLink className="size-3.5" />
              前往详情页查看更多配置
            </button>
          </div>

          <SheetFooter className="flex flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>取消</Button>
            <Button onClick={saveSettings}>保存</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

function ChapterItem({
  chapter,
  active,
  onSelect,
  onToggle,
}: {
  chapter: Chapter
  active: boolean
  onSelect: () => void
  onToggle: () => void
}) {
  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm transition-colors",
          active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
        )}
      >
        <button
          onClick={onToggle}
          className="flex size-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-border"
          aria-label={chapter.expanded ? "折叠" : "展开"}
        >
          <ChevronRight
            className={cn("size-3.5 transition-transform", chapter.expanded && "rotate-90")}
          />
        </button>
        <button onClick={onSelect} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
          <span className="truncate">{chapter.title}</span>
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {chapterWordCount(chapter)}
          </span>
        </button>
      </div>

      {chapter.expanded && chapter.acts.length > 0 && (
        <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-2 pt-0.5">
          {chapter.acts.map((act, i) => (
            <button
              key={act.id}
              onClick={onSelect}
              className="flex items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Circle className="size-1.5 shrink-0 fill-current" />
              <span className="truncate">第 {i + 1} 幕</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
