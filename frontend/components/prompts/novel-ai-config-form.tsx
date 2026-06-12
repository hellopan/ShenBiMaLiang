"use client"

import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ModelConfig, NovelAIConfig } from "@/lib/types"

type Props = {
  config: NovelAIConfig
  models: ModelConfig[]
  onChange: (patch: Partial<NovelAIConfig>) => void
  hint?: string
}

export function NovelAIConfigForm({ config, models, onChange, hint }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {models.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">模型</label>
          <Select
            value={config.model || models[0]?.id || ""}
            onValueChange={(v) => onChange({ model: v ?? "" })}
          >
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue>
                {() =>
                  models.find((m) => m.id === config.model)?.label ??
                  models[0]?.label ??
                  "选择模型"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">温度</label>
          <span className="text-xs tabular-nums">{config.temperature.toFixed(1)}</span>
        </div>
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={[config.temperature]}
          onValueChange={(v) => onChange({ temperature: Array.isArray(v) ? v[0] : v })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Top P</label>
          <span className="text-xs tabular-nums">{config.topP.toFixed(2)}</span>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={[config.topP]}
          onValueChange={(v) => onChange({ topP: Array.isArray(v) ? v[0] : v })}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-muted-foreground">Top K</label>
        <Input
          type="number"
          min={1}
          max={100}
          value={config.topK}
          onChange={(e) => onChange({ topK: parseInt(e.target.value) || 1 })}
          className="h-7 w-20 text-xs"
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-muted-foreground">最大回复长度</label>
        <Input
          type="number"
          min={1000}
          value={config.maxTokens}
          onChange={(e) => onChange({ maxTokens: parseInt(e.target.value) || 60000 })}
          className="h-7 w-28 text-xs"
        />
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
