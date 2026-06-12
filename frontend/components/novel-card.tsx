"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Trash2, Clock, FileText } from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { type Novel, novelWordCount, relativeTime } from "@/lib/types"

type Props = {
  novel: Novel
  onDelete: (id: string) => void
}

export function NovelCard({ novel, onDelete }: Props) {
  const router = useRouter()
  const words = novelWordCount(novel)
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleDelete() {
    onDelete(novel.id)
    toast.success(`《${novel.title}》已删除`)
  }

  return (
    <>
      <Card className="group relative flex flex-col gap-0 overflow-hidden transition-colors hover:border-primary/50">
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-balance text-base leading-snug">{novel.title}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {novel.genre}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <CardDescription className="line-clamp-3 leading-relaxed">
            {novel.synopsis || "暂无简介"}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FileText className="size-3.5" />
            {words.toLocaleString()} 字
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {relativeTime(novel.updatedAt)}
          </span>
        </CardFooter>

        {/* Hover actions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-card via-card/95 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
          <Button size="sm" onClick={() => router.push(`/novel/${novel.id}`)}>
            <BookOpen />
            打开
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirmOpen(true)}
            aria-label="删除小说"
          >
            <Trash2 />
            删除
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="删除小说"
        description={`确定要删除《${novel.title}》吗？相关章节与词条将一并删除，此操作不可撤销。`}
        confirmLabel="删除"
        onConfirm={handleDelete}
      />
    </>
  )
}
