"use client"

import { PageHeader } from "@/components/page-header"
import { EncyclopediaPanel } from "@/components/encyclopedia/encyclopedia-panel"

export default function EncyclopediaPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="世界观词条" />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <EncyclopediaPanel />
      </main>
    </div>
  )
}
