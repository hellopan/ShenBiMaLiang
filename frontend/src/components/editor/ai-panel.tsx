"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles, Square, Check, X, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

type Props = {
  /** Called when user accepts generated text */
  onAccept: (text: string) => void
  /** Source outline/content used to fabricate a mock expansion */
  sourceOutline: string
}

const MOCK_EXPAND =
  "夜色如墨，泼洒在青云山脉连绵的峰峦之上。林墨独自盘膝坐在断崖边，残剑横于膝前，剑身上那层经年的锈迹在月光下泛着幽冷的微光。他闭目凝神，引导着体内那道初醒的灵脉缓缓流转，每一次呼吸都仿佛与天地间无形的气机共鸣。\n\n忽然，残剑轻轻一颤，发出一声几不可闻的清鸣。林墨睁开双眼，眸中映着剑光，亦映着远方翻涌的云海。他知道，从踏入裂谷的那一刻起，命运的齿轮便已不可逆转地转动起来。前路漫漫，纵有万难，他也要握紧手中这柄古剑，一步步走向那传说中的星河之巅。"

const MOCK_REWRITE =
  "墨色夜幕低垂，将青云山脉层叠的山峰尽数吞没。崖边，林墨独坐，膝上横着那柄残剑——锈蚀的剑身在清辉里透出一缕冷光。他敛目调息，牵引着方才苏醒的灵脉于经脉间游走，呼吸之间，似与天地气机暗暗相和。"

export function AiPanel({ onAccept, sourceOutline }: Props) {
  const { models } = useStore()
  const activeModels = models.filter((m) => m.active)
  const [modelId, setModelId] = useState(activeModels[0]?.id ?? "")
  const [mode, setMode] = useState<"expand" | "rewrite">("expand")
  const [output, setOutput] = useState("")
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle")
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => () => stopTimer(), [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [output])

  function generate() {
    stopTimer()
    const full = mode === "expand" ? MOCK_EXPAND : MOCK_REWRITE
    setOutput("")
    setStatus("generating")
    let i = 0
    timerRef.current = setInterval(() => {
      i += 1
      setOutput(full.slice(0, i))
      if (i >= full.length) {
        stopTimer()
        setStatus("done")
      }
    }, 28)
  }

  function stop() {
    stopTimer()
    setStatus(output ? "done" : "idle")
  }

  function accept() {
    onAccept(output)
    reset()
  }

  function reset() {
    stopTimer()
    setOutput("")
    setStatus("idle")
  }

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-l border-border bg-sidebar">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">AI 操作</h2>
      </div>

      <div className="flex flex-col gap-3 border-b border-border p-4">
        <Select value={modelId} onValueChange={setModelId}>
          <SelectTrigger size="sm" className="w-full">
            <Cpu className="size-3.5 text-muted-foreground" />
            <SelectValue placeholder="选择模型">
              {() => activeModels.find((m) => m.id === modelId)?.label ?? "选择模型"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {activeModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "expand" | "rewrite")}>
          <TabsList className="w-full">
            <TabsTrigger value="expand" className="flex-1">
              扩写
            </TabsTrigger>
            <TabsTrigger value="rewrite" className="flex-1">
              改写
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="p-4">
          {output ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {output}
              {status === "generating" && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-text-bottom" />
              )}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <p className="text-xs text-muted-foreground">
                {mode === "expand"
                  ? "基于当前幕大纲，AI 将为你生成正文内容。"
                  : "AI 将润色并改写当前幕的正文。"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-4">
        {status === "generating" ? (
          <Button variant="outline" onClick={stop} className="w-full">
            <Square data-icon="inline-start" />
            停止生成
          </Button>
        ) : status === "done" ? (
          <div className="flex gap-2">
            <Button onClick={accept} className="flex-1">
              <Check data-icon="inline-start" />
              采用
            </Button>
            <Button variant="outline" onClick={reset} className="flex-1">
              <X data-icon="inline-start" />
              丢弃
            </Button>
          </div>
        ) : (
          <Button onClick={generate} disabled={!modelId} className="w-full">
            <Sparkles data-icon="inline-start" />
            {mode === "expand" ? "开始扩写" : "开始改写"}
          </Button>
        )}
        {sourceOutline && status === "idle" && (
          <p className={cn("line-clamp-2 text-[11px] leading-relaxed text-muted-foreground")}>
            参考大纲：{sourceOutline}
          </p>
        )}
      </div>
    </aside>
  )
}
