'use client'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { ScrollText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function LogsPage() {
  return (
    <div className="flex h-screen">
      <AppSidebar mode="home" activeItem="logs" />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">请求日志</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">AI 接口调用记录与详情</p>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <div className="p-4 rounded-2xl bg-muted">
                <ScrollText className="size-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">请求日志</h2>
              <p className="text-muted-foreground text-sm text-center max-w-sm">
                查看所有 AI 请求记录，包括提示词、响应内容与耗时
              </p>
              <Badge variant="outline" className="text-xs">即将推出</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
