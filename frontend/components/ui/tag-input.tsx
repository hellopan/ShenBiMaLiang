"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FieldDescription } from "@/components/ui/field"

type TagInputProps = {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  description?: string
  id?: string
}

export function TagInput({
  tags,
  onChange,
  placeholder = "输入后回车添加",
  description,
  id,
}: TagInputProps) {
  const [input, setInput] = useState("")

  function addTag() {
    const tag = input.trim()
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInput("")
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        data-slot="tag-input"
        className="flex min-h-8 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5 transition-colors focus-within:border-ring"
      >
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`移除 ${tag}`}
              className="transition-colors hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          id={id}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={addTag}
          placeholder={tags.length ? "" : placeholder}
          className="h-7 min-h-0 min-w-24 flex-1 border-0 bg-transparent text-sm shadow-none outline-none ring-0 placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0"
        />
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
    </div>
  )
}
