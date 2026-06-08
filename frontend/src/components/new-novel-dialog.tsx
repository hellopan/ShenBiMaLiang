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

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: { title: string; genre: string; synopsis: string }) => void
}

export function NewNovelDialog({ open, onOpenChange, onCreate }: Props) {
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("")
  const [synopsis, setSynopsis] = useState("")

  function reset() {
    setTitle("")
    setGenre("")
    setSynopsis("")
  }

  function submit() {
    onCreate({ title: title.trim(), genre: genre.trim(), synopsis: synopsis.trim() })
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
      <DialogContent>
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
            <FieldLabel htmlFor="novel-genre">题材</FieldLabel>
            <Input
              id="novel-genre"
              placeholder="例如：玄幻修真 / 悬疑推理"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
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
