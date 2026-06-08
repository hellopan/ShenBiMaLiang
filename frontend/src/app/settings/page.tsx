"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Cpu, Settings2, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { PageHeader } from "@/components/page-header"
import { ModelDialog } from "@/components/model-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { ModelConfig, Provider } from "@/lib/types"

const providerVariant: Record<Provider, "default" | "secondary" | "outline"> = {
  OpenAI: "default",
  Anthropic: "secondary",
  DeepSeek: "secondary",
  Custom: "outline",
}

export default function SettingsPage() {
  const { models, setModels } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ModelConfig | null>(null)

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(model: ModelConfig) {
    setEditing(model)
    setDialogOpen(true)
  }

  function save(newModels: ModelConfig[]) {
    setModels((prev) => {
      // When editing, remove the original entry and replace with new ones
      const without = editing ? prev.filter((m) => m.id !== editing.id) : prev
      return [...without, ...newModels]
    })
  }

  function remove(id: string) {
    setModels((prev) => prev.filter((m) => m.id !== id))
  }

  function toggle(id: string, active: boolean) {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, active } : m)))
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="设置" />

      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-10">
        {/* 模型配置 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Cpu className="size-4.5 text-primary" />
                模型配置
              </h2>
              <p className="text-sm text-muted-foreground">
                管理用于 AI 扩写与改写的大语言模型。
              </p>
            </div>
            <Button onClick={openAdd}>
              <Plus data-icon="inline-start" />
              添加模型
            </Button>
          </div>

          {models.length === 0 ? (
            <Empty className="rounded-xl border border-dashed border-border py-14">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Cpu />
                </EmptyMedia>
                <EmptyTitle>尚未配置模型</EmptyTitle>
                <EmptyDescription>添加一个模型后即可在编辑器中调用 AI。</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Card className="py-0">
              <CardContent className="flex flex-col px-0">
                {models.map((m, i) => (
                  <div key={m.id}>
                    {i > 0 && <Separator />}
                    <div className="flex items-center gap-4 px-5 py-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{m.label}</span>
                          <Badge variant={providerVariant[m.provider]}>{m.provider}</Badge>
                        </div>
                        <code className="truncate font-mono text-xs text-muted-foreground">
                          {m.modelName}
                        </code>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={m.active}
                          onCheckedChange={(v) => toggle(m.id, v)}
                          aria-label="启用模型"
                        />
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => openEdit(m)}
                          aria-label="编辑"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => remove(m.id)}
                          aria-label="删除"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        {/* 通用设置 */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Settings2 className="size-4.5 text-primary" />
              通用设置
            </h2>
            <p className="text-sm text-muted-foreground">编辑器与界面的偏好设置。</p>
          </div>
          <Card>
            <CardContent className="flex flex-col gap-4 py-6">
              <SettingRow title="自动保存" desc="编辑时自动保存草稿（敬请期待）。" disabled />
              <Separator />
              <SettingRow title="生成时显示字数" desc="在扩写过程中实时显示字数统计（敬请期待）。" disabled />
              <Separator />
              <ThemeSettingRow />
            </CardContent>
          </Card>
        </section>
      </main>

      <ModelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={save}
      />
    </div>
  )
}

function SettingRow({
  title,
  desc,
  checked,
  disabled,
}: {
  title: string
  desc: string
  checked?: boolean
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </div>
      <Switch defaultChecked={checked} disabled={disabled} aria-label={title} />
    </div>
  )
}

function ThemeSettingRow() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">外观主题</span>
          <span className="text-xs text-muted-foreground">切换界面的明暗主题</span>
        </div>
        <div className="h-9 w-[140px] animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">外观主题</span>
        <span className="text-xs text-muted-foreground">切换界面的明暗主题</span>
      </div>
      <div className="flex items-center rounded-lg border border-border p-0.5">
        <button
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            theme === "light"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={theme === "light"}
        >
          <Sun className="size-3.5" />
          浅色
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            theme === "dark"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={theme === "dark"}
        >
          <Moon className="size-3.5" />
          深色
        </button>
      </div>
    </div>
  )
}
