"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Check, Loader2, RefreshCw } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { type ModelConfig, type Provider } from "@/lib/types"
import { uid } from "@/lib/store"

// ── Constants ─────────────────────────────────────────────────────────────────
const PROVIDERS: Provider[] = ["OpenAI", "Anthropic", "DeepSeek", "Custom"]

const MOCK_MODELS: Record<Provider, string[]> = {
  OpenAI: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1", "o1-mini"],
  Anthropic: ["claude-opus-4-5-20251101", "claude-sonnet-4-5", "claude-haiku-4-5"],
  DeepSeek: ["deepseek-chat", "deepseek-reasoner"],
  Custom: ["custom-model-1", "custom-model-2"],
}

// ── Types ─────────────────────────────────────────────────────────────────────
type ConnectState = "idle" | "connecting" | "connected" | "error"

type ModelRow = {
  id: string
  alias: string
  enabled: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: ModelConfig | null
  onSave: (models: ModelConfig[]) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ModelDialog({ open, onOpenChange, initial, onSave }: Props) {
  const [label, setLabel] = useState("")
  const [provider, setProvider] = useState<Provider>("OpenAI")
  const [baseUrl, setBaseUrl] = useState("")
  const [apiKey, setApiKey] = useState("")

  const [connectState, setConnectState] = useState<ConnectState>("idle")
  const [connectError, setConnectError] = useState("")
  const [modelRows, setModelRows] = useState<ModelRow[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? "")
      setProvider(initial?.provider ?? "OpenAI")
      setBaseUrl(initial?.baseUrl ?? "")
      setApiKey(initial?.apiKey ?? "")
      setConnectState("idle")
      setConnectError("")
      setModelRows([])
    }
    return clearTimer
  }, [open, initial])

  function runConnect(mergeRows?: ModelRow[]) {
    clearTimer()
    setConnectState("connecting")
    setConnectError("")
    timerRef.current = setTimeout(() => {
      const ids = MOCK_MODELS[provider] ?? []
      const rows: ModelRow[] = ids.map((id) => {
        const existing = mergeRows?.find((r) => r.id === id)
        return { id, alias: existing?.alias ?? "", enabled: existing?.enabled ?? true }
      })
      setModelRows(rows)
      setConnectState("connected")
    }, 1500)
  }

  function handleConnect() {
    if (!apiKey.trim()) return
    runConnect()
  }

  function handleRefresh() {
    if (refreshing || connectState !== "connected") return
    setRefreshing(true)
    clearTimer()
    timerRef.current = setTimeout(() => {
      const ids = MOCK_MODELS[provider] ?? []
      const rows: ModelRow[] = ids.map((id) => {
        const existing = modelRows.find((r) => r.id === id)
        return { id, alias: existing?.alias ?? "", enabled: existing?.enabled ?? true }
      })
      setModelRows(rows)
      setRefreshing(false)
    }, 1000)
  }

  function updateRow(id: string, patch: Partial<ModelRow>) {
    setModelRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function submit() {
    const configs: ModelConfig[] = modelRows
      .filter((r) => r.enabled)
      .map((r) => ({
        id: uid(),
        label: r.alias.trim() || r.id,
        provider,
        modelName: r.id,
        apiKey,
        baseUrl: baseUrl.trim() || undefined,
        maxTokens: 4096,
        active: true,
      }))
    onSave(configs)
    onOpenChange(false)
  }

  const hasEnabled = modelRows.some((r) => r.enabled)
  const canSave = connectState === "connected" && hasEnabled

  const showModelPanel = connectState === "connecting" || connectState === "connected"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "编辑模型配置" : "添加模型"}</DialogTitle>
          <DialogDescription>连接模型提供商，选择需要启用的模型。</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          {/* Display name */}
          <Field>
            <FieldLabel htmlFor="m-label">名称</FieldLabel>
            <Input
              id="m-label"
              placeholder="例如：我的 DeepSeek"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </Field>

          {/* Provider */}
          <Field>
            <FieldLabel htmlFor="m-provider">提供商</FieldLabel>
            <Select
              value={provider}
              onValueChange={(v) => {
                setProvider(v as Provider)
                setConnectState("idle")
                setConnectError("")
                setModelRows([])
              }}
            >
              <SelectTrigger id="m-provider" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {/* Base URL */}
          <Field>
            <FieldLabel htmlFor="m-url">
              Base URL{" "}
              <span className="font-normal text-muted-foreground">（可选）</span>
            </FieldLabel>
            <Input
              id="m-url"
              placeholder="https://api.example.com/v1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <FieldDescription>使用自定义或代理端点时填写。</FieldDescription>
          </Field>

          {/* API Key + Connect */}
          <Field>
            <FieldLabel htmlFor="m-key">API Key</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="m-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  if (connectState === "connected" || connectState === "error") {
                    setConnectState("idle")
                    setConnectError("")
                    setModelRows([])
                    clearTimer()
                  }
                }}
                className={cn(
                  "flex-1 transition-colors",
                  connectState === "connected" &&
                    "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/30",
                )}
              />
              <Button
                type="button"
                onClick={handleConnect}
                disabled={!apiKey.trim() || connectState === "connecting"}
                className={cn(
                  "shrink-0 min-w-[88px] transition-all duration-300",
                  connectState === "connected" &&
                    "border-green-600 bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500/30",
                )}
              >
                {connectState === "connecting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                    连接中…
                  </>
                ) : connectState === "connected" ? (
                  <>
                    <Check className="size-4" data-icon="inline-start" />
                    已连接
                  </>
                ) : (
                  connectState === "error" ? "重新连接" : "连接"
                )}
              </Button>
            </div>

            {/* Error hint */}
            {connectState === "error" && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0" />
                {connectError || "连接失败，请检查 API Key 是否正确"}
              </div>
            )}
          </Field>
        </FieldGroup>

        {/* ── Model list ─────────────────────────────────────────────────── */}
        {showModelPanel && (
          <div
            className={cn(
              "overflow-hidden rounded-lg border border-border",
              connectState === "connected" && "animate-in fade-in-0 slide-in-from-top-1 duration-300",
            )}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
              <span className="text-xs font-semibold text-muted-foreground">可用模型</span>
              {connectState === "connected" && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <RefreshCw className={cn("size-3", refreshing && "animate-spin")} />
                  刷新列表
                </button>
              )}
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-[1fr_1fr_48px] gap-3 border-b border-border bg-muted/20 px-3 py-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">模型 ID</span>
              <span className="text-[11px] font-medium text-muted-foreground">别名</span>
              <span className="text-[11px] font-medium text-muted-foreground text-center">启用</span>
            </div>

            {/* Rows */}
            <div className="max-h-[320px] overflow-y-auto">
              {connectState === "connecting" ? (
                <SkeletonRows />
              ) : (
                <div>
                  {modelRows.map((row, i) => (
                    <div
                      key={row.id}
                      className={cn(
                        "grid grid-cols-[1fr_1fr_48px] items-center gap-3 px-3 py-2 transition-opacity",
                        i % 2 === 1 && "bg-muted/10",
                        !row.enabled && "opacity-40",
                      )}
                    >
                      <code className="truncate font-mono text-xs text-muted-foreground">
                        {row.id}
                      </code>
                      <Input
                        placeholder="自定义显示名"
                        value={row.alias}
                        onChange={(e) => updateRow(row.id, { alias: e.target.value })}
                        className="h-7 px-2 text-xs"
                      />
                      <div className="flex justify-center">
                        <Switch
                          checked={row.enabled}
                          onCheckedChange={(v) => updateRow(row.id, { enabled: v })}
                          className="scale-90"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enabled count */}
            {connectState === "connected" && (
              <div className="border-t border-border bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
                已启用 {modelRows.filter((r) => r.enabled).length} / {modelRows.length} 个模型
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit} disabled={!canSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Skeleton loading rows ─────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "grid grid-cols-[1fr_1fr_48px] items-center gap-3 px-3 py-2",
            i % 2 === 1 && "bg-muted/10",
          )}
        >
          <div className="h-3.5 animate-pulse rounded bg-muted" />
          <div className="h-3.5 animate-pulse rounded bg-muted opacity-60" style={{ width: `${60 + i * 15}%` }} />
          <div className="mx-auto h-4 w-7 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}
