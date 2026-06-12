"use client"

import { NOVEL_GENRES } from "@/lib/genres"
import { TagInput } from "@/components/ui/tag-input"
import { cn } from "@/lib/utils"

type NovelGenrePickerProps = {
  value: string[]
  onChange: (tags: string[]) => void
}

const presetSet = new Set<string>(NOVEL_GENRES)

export function NovelGenrePicker({ value, onChange }: NovelGenrePickerProps) {
  function togglePreset(genre: string) {
    if (value.includes(genre)) {
      onChange(value.filter((t) => t !== genre))
    } else {
      onChange([...value, genre])
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <TagInput
        id="novel-genre-tags"
        tags={value}
        onChange={onChange}
        placeholder="输入自定义题材"
        description="回车或逗号添加自定义题材，可多选"
      />
      <div className="flex flex-wrap gap-1.5">
        {NOVEL_GENRES.map((genre) => {
          const selected = value.includes(genre)
          return (
            <button
              key={genre}
              type="button"
              onClick={() => togglePreset(genre)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                selected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {genre}
            </button>
          )
        })}
      </div>
    </div>
  )
}
