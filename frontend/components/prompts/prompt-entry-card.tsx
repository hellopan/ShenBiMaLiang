"use client"

import { Eye, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  type PromptEntry,
  PROMPT_GROUP_LABELS,
  PROMPT_GROUP_BADGE_CLASS,
  PROMPT_SCOPE_BADGE_CLASS,
} from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  entry: PromptEntry
  novelTitle?: string
  onEdit: () => void
  onDelete: () => void
  onToggleActive: (active: boolean) => void
  onPreview?: () => void
  readOnly?: boolean
}

export function PromptEntryCard({
  entry,
  novelTitle,
  onEdit,
  onDelete,
  onToggleActive,
  onPreview,
  readOnly = false,
}: Props) {
  return (
    <Card className={cn("group flex flex-col gap-0", !entry.active && "opacity-60")}>
      <CardHeader className="gap-2">
        <CardTitle className="text-base leading-snug">{entry.name}</CardTitle>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn("text-[10px]", PROMPT_SCOPE_BADGE_CLASS[entry.scope])}>
            {entry.scope === "global" ? "全局" : "小说级"}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px]", PROMPT_GROUP_BADGE_CLASS[entry.group])}>
            {PROMPT_GROUP_LABELS[entry.group]}
          </Badge>
          <Badge variant="outline" className="text-[10px] tabular-nums">
            权重 {entry.weight}
          </Badge>
        </div>
        {entry.scope === "novel" && novelTitle && (
          <p className="text-xs text-muted-foreground">《{novelTitle}》</p>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{entry.content}</p>
      </CardContent>
      <CardFooter className="justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Switch checked={entry.active} onCheckedChange={onToggleActive} aria-label="启用词条" />
          <span className="text-xs text-muted-foreground">{entry.active ? "已启用" : "已禁用"}</span>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onPreview && (
            <Button size="icon-sm" variant="ghost" onClick={onPreview} aria-label="预览">
              <Eye />
            </Button>
          )}
          {!readOnly && (
            <>
              <Button size="icon-sm" variant="ghost" onClick={onEdit} aria-label="编辑">
                <Pencil />
              </Button>
              {!entry.isSystem && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={onDelete}
                  aria-label="删除"
                  className="hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
