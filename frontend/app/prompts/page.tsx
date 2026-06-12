"use client"

import { useRef } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  PromptEntriesPanel,
  type PromptEntriesPanelHandle,
} from "@/components/prompts/prompt-entries-panel"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function PromptsPage() {
  const panelRef = useRef<PromptEntriesPanelHandle>(null)

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AppSidebar mode="home" activeItem="prompts" />

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-end justify-between px-8 pt-8 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">提示词库</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              管理全局与小说级提示词词条
            </p>
          </div>
          <Button onClick={() => panelRef.current?.openAdd()}>
            <Plus data-icon="inline-start" />
            新建词条
          </Button>
        </div>

        <div className="px-8 pb-12">
          <PromptEntriesPanel ref={panelRef} showScopeFilter hideAddButton />
        </div>
      </main>
    </div>
  )
}
