"use client"

import { TagInput } from "@/components/ui/tag-input"
import { cn } from "@/lib/utils"

type PresetTagPickerProps = {
  presets: readonly string[]
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  description?: string
  id?: string
  single?: boolean
}

export function PresetTagPicker({
  presets,
  value,
  onChange,
  placeholder = "输入自定义标签",
  description,
  id,
  single = false,
}: PresetTagPickerProps) {
  function applyTags(tags: string[]) {
    onChange(single ? tags.slice(-1) : tags)
  }

  function togglePreset(preset: string) {
    if (single) {
      onChange(value.includes(preset) ? [] : [preset])
      return
    }
    if (value.includes(preset)) {
      onChange(value.filter((t) => t !== preset))
    } else {
      onChange([...value, preset])
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <TagInput
        id={id}
        tags={value}
        onChange={applyTags}
        placeholder={placeholder}
        description={description}
      />
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => {
          const selected = value.includes(preset)
          return (
            <button
              key={preset}
              type="button"
              onClick={() => togglePreset(preset)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                selected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {preset}
            </button>
          )
        })}
      </div>
    </div>
  )
}
