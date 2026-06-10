"use client"

import { GitCommit, Package } from "lucide-react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const CHANGELOG = [
  { version: "v0.3.0", date: "2026-06", desc: "编辑器幕级AI配置、小说详情页重构" },
  { version: "v0.2.0", date: "2026-05", desc: "世界观词条、模型配置管理" },
  { version: "v0.1.0", date: "2026-04", desc: "初始版本，基础编辑器功能" },
]

export default function AboutPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AppSidebar mode="home" activeItem="about" />

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 pt-8 pb-6">
          <h1 className="text-2xl font-bold tracking-tight">关于</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">版本信息与更新日志</p>
        </div>

        <div className="flex flex-col gap-4 px-8 pb-12 max-w-3xl">
          {/* 更新日志 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
                  <GitCommit className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">更新日志</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-0">
              {CHANGELOG.map((entry, i) => (
                <div key={entry.version}>
                  <div className="flex items-start gap-3 py-3">
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {entry.version}
                    </Badge>
                    <span className="shrink-0 text-xs text-muted-foreground pt-0.5">{entry.date}</span>
                    <span className="text-sm">{entry.desc}</span>
                  </div>
                  {i < CHANGELOG.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 版本说明 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
                  <Package className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">版本说明</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 text-muted-foreground">当前版本</span>
                <Badge variant="secondary" className="font-mono text-xs">v0.3.0-alpha</Badge>
              </div>
              <Separator />
              <div className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 text-muted-foreground">开源协议</span>
                <span>AGPL v3</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 text-muted-foreground">GitHub</span>
                <a
                  href="https://github.com/你的用户名/ShenBiMaLiang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-4"
                >
                  github.com/你的用户名/ShenBiMaLiang
                </a>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground pt-1">
                神笔马良是一款开源的 AI 辅助网文创作工具
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
