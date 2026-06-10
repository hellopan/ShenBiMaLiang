"use client"

import { Lightbulb } from "lucide-react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function InspirationPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar mode="home" activeItem="inspiration" />

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 pt-8 pb-6">
          <h1 className="text-2xl font-bold tracking-tight">灵感片段</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">随手记录创作灵感与素材片段</p>
        </div>

        <div className="px-8 pb-12">
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="p-4 rounded-2xl bg-muted">
                  <Lightbulb className="size-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">灵感片段</h2>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                  随手记录创作灵感、素材片段，AI 写作时可作为参考注入
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
