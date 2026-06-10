"use client"

import { BarChart2, Zap } from "lucide-react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function StatsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar mode="home" activeItem="stats" />

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 pt-8 pb-6">
          <h1 className="text-2xl font-bold tracking-tight">统计分析</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">写作数据与 AI 用量分析</p>
        </div>

        <div className="flex flex-col gap-4 px-8 pb-12">
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center min-h-[320px] gap-4">
                <div className="p-4 rounded-2xl bg-muted">
                  <BarChart2 className="size-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">写作统计</h2>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                  查看每日写作字数、创作趋势与习惯分析
                </p>
                <Badge variant="outline" className="text-xs">即将推出</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center min-h-[320px] gap-4">
                <div className="p-4 rounded-2xl bg-muted">
                  <Zap className="size-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">Token 用量</h2>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                  追踪 AI 接口调用量与 Token 消耗，估算使用成本
                </p>
                <Badge variant="outline" className="text-xs">即将推出</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
