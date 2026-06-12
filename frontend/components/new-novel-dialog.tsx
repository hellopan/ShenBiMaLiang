"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { NovelGenrePicker } from "@/components/novel-genre-picker"
import { formatGenres } from "@/lib/genres"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: { title: string; genre: string; synopsis: string }) => void
}

export function NewNovelDialog({ open, onOpenChange, onCreate }: Props) {
  const [title, setTitle] = useState("")
  const [genreTags, setGenreTags] = useState<string[]>([])
  const [synopsis, setSynopsis] = useState("")

  function reset() {
    setTitle("")
    setGenreTags([])
    setSynopsis("")
  }

  function submit() {
    onCreate({
      title: title.trim(),
      genre: formatGenres(genreTags),
      synopsis: synopsis.trim(),
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="w-200 max-w-[90vw] max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建小说</DialogTitle>
          <DialogDescription>填写基本信息，开启你的创作之旅。</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="novel-title">书名</FieldLabel>
            <Input
              id="novel-title"
              placeholder="例如：剑落星河"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel>题材</FieldLabel>
            <NovelGenrePicker value={genreTags} onChange={setGenreTags} />
          </Field>
          <Field>
            <FieldLabel htmlFor="novel-synopsis">简介</FieldLabel>
            <Textarea
              id="novel-synopsis"
              placeholder="一句话或一段话，概括故事梗概……"
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit} disabled={!title.trim()}>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
