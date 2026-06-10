'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Plus, Pencil, Trash2, Cpu, Settings2, Sparkles, Sun, Moon } from 'lucide-react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ModelDialog } from '@/components/model-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { ModelConfig, Provider } from '@/lib/types'

const providerVariant: Record<Provider, 'default' | 'secondary' | 'outline'> = {
  OpenAI: 'default',
  Anthropic: 'secondary',
  DeepSeek: 'secondary',
  Custom: 'outline',
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
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AppSidebar mode="home" activeItem="settings" />

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 pt-8 pb-6">
          <h1 className="text-2xl font-bold tracking-tight">设置</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">管理模型配置与偏好设置</p>
        </div>

        <div className="flex max-w-3xl flex-col gap-10 px-8 pb-12">
          {/* 模型配置 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Cpu className="size-4.5 text-primary" />
                  模型配置
                </h2>
                <p className="text-sm text-muted-foreground">
                  添加 AI 大语言模型的接入配置
                </p>
              </div>
              <Button onClick={openAdd}>
                <Plus />
                添加模型
              </Button>
            </div>

            {models.length === 0 ? (
              <Empty className="rounded-xl border border-dashed border-white/10 py-14">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Cpu />
                  </EmptyMedia>
                  <EmptyTitle>暂无模型</EmptyTitle>
                  <EmptyDescription>尚未添加任何模型，点击上方按鈕开始配置 AI。</EmptyDescription>
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

          {/* 偏好设置 */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Settings2 className="size-4.5 text-primary" />
                偏好设置
              </h2>
              <p className="text-sm text-muted-foreground">自定义应用偏好与界面设置</p>
            </div>
            <Card>
              <CardContent className="flex flex-col gap-4 py-6">
                <SettingRow title="自动保存" desc="编辑内容时自动保存到本地存储" disabled />
                <Separator />
                <SettingRow title="实时字数" desc="在编辑器底部实时显示当前章节字数" disabled />
                <Separator />
                <ThemeSettingRow />
              </CardContent>
            </Card>
          </section>
        </div>
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

const THEMES = [
  { value: 'glass', label: '毛玻璃', icon: Sparkles },
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
] as const

function ThemeSettingRow() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">主题外观</span>
        <span className="text-xs text-muted-foreground">切换应用主题风格</span>
      </div>
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-1">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              theme === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
