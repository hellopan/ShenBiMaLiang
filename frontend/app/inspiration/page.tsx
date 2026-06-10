'use client'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function InspirationPage() {
  return (
    <div className="flex h-screen">
      <AppSidebar mode="home" activeItem="inspiration" />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <div className="p-4 rounded-2xl bg-muted">
            <Lightbulb className="size-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">灵感片段</h2>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            随手记录创作灵感、素材片段，AI 写作时可作为参考注入
          </p>
          <Badge variant="outline" className="text-xs">即将推出</Badge>
        </div>
      </main>
    </div>
  )
}
